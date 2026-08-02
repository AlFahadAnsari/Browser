import { join } from 'node:path'
import { WebContentsView, shell, type BaseWindow, type WebContents } from 'electron'
import { INITIAL_BROWSER_STATE, type BrowserState, type ViewBounds } from '@/types/browser'
import { getHostname, isNavigableUrl, resolveAddress } from '@/utils/url'
import { applyGeolocationEmulation, releaseGeolocationEmulation } from '@/electron/geo/geolocation'
import { historyRepository } from '@/electron/store/historyRepository'
import { getWebsiteSession } from './websiteSession'

const EMPTY_BOUNDS: ViewBounds = { x: 0, y: 0, width: 0, height: 0 }

type StateListener = (state: BrowserState) => void

/**
 * Owns the single `WebContentsView` that renders websites.
 *
 * There is exactly one of these for the lifetime of the window — no tabs, no extra
 * windows. The React UI draws the chrome around it and tells it where to sit.
 */
export class WebsiteView {
  private readonly view: WebContentsView
  private readonly window: BaseWindow
  private readonly listeners = new Set<StateListener>()

  private state: BrowserState = { ...INITIAL_BROWSER_STATE }
  private bounds: ViewBounds = { ...EMPTY_BOUNDS }
  private visible = false
  /** History row representing the page currently on screen, so titles can be back-filled. */
  private currentHistoryId: string | null = null

  constructor(window: BaseWindow, backgroundColor: string) {
    this.window = window

    this.view = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, '../preload/website-preload.js'),
        session: getWebsiteSession(),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        safeDialogs: true,
        spellcheck: false,
        // Websites are throttled when the window is in the background — this is the whole
        // point of a lightweight viewer.
        backgroundThrottling: true,
      },
    })

    this.view.setBackgroundColor(backgroundColor)
    this.view.setVisible(false)
    this.view.setBounds(EMPTY_BOUNDS)
    this.window.contentView.addChildView(this.view)

    void applyGeolocationEmulation(this.contents)
    this.registerContentsEvents()
  }

  private get contents(): WebContents {
    return this.view.webContents
  }

  // ---------------------------------------------------------------- navigation

  /** Resolves address bar input (URL, bare domain or search term) and loads it. */
  async navigate(input: string): Promise<BrowserState> {
    const resolved = resolveAddress(input)
    if (!resolved) return this.getState()

    this.patchState({ error: null, isLoading: true, url: resolved.href })

    try {
      await this.contents.loadURL(resolved.href)
    } catch {
      /* failures surface through `did-fail-load`, which owns the error message */
    }

    return this.getState()
  }

  goBack(): BrowserState {
    if (this.contents.navigationHistory.canGoBack()) this.contents.navigationHistory.goBack()
    return this.getState()
  }

  goForward(): BrowserState {
    if (this.contents.navigationHistory.canGoForward()) this.contents.navigationHistory.goForward()
    return this.getState()
  }

  reload(): BrowserState {
    if (this.state.url) this.contents.reload()
    return this.getState()
  }

  stop(): BrowserState {
    this.contents.stop()
    return this.getState()
  }

  // ------------------------------------------------------------------- layout

  setBounds(bounds: ViewBounds): void {
    this.bounds = {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.max(0, Math.round(bounds.width)),
      height: Math.max(0, Math.round(bounds.height)),
    }
    if (this.visible) this.view.setBounds(this.bounds)
  }

  setVisible(visible: boolean): void {
    if (this.visible === visible) return
    this.visible = visible
    this.view.setVisible(visible)
    this.view.setBounds(visible ? this.bounds : EMPTY_BOUNDS)
  }

  setBackgroundColor(color: string): void {
    this.view.setBackgroundColor(color)
  }

  // -------------------------------------------------------------------- state

  getState(): BrowserState {
    return { ...this.state }
  }

  onStateChanged(listener: StateListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  destroy(): void {
    this.listeners.clear()
    releaseGeolocationEmulation(this.contents)
    this.window.contentView.removeChildView(this.view)
    this.contents.close()
  }

  // ------------------------------------------------------------------ internals

  private patchState(patch: Partial<BrowserState>): void {
    const next: BrowserState = { ...this.state, ...patch }

    const unchanged =
      next.url === this.state.url &&
      next.title === this.state.title &&
      next.canGoBack === this.state.canGoBack &&
      next.canGoForward === this.state.canGoForward &&
      next.isLoading === this.state.isLoading &&
      next.error === this.state.error

    if (unchanged) return

    this.state = next
    for (const listener of this.listeners) listener({ ...next })
  }

  /** Recomputes the parts of the state that are always derived from the web contents. */
  private syncNavigationState(patch: Partial<BrowserState> = {}): void {
    if (this.contents.isDestroyed()) return
    this.patchState({
      url: this.contents.getURL(),
      canGoBack: this.contents.navigationHistory.canGoBack(),
      canGoForward: this.contents.navigationHistory.canGoForward(),
      ...patch,
    })
  }

  private recordVisit(url: string): void {
    this.currentHistoryId = historyRepository.record(url, getHostname(url))
  }

  private registerContentsEvents(): void {
    const contents = this.contents

    // Cross-site navigations swap the renderer process, which drops the locale/timezone
    // overrides, so the emulation is re-armed on every main frame navigation.
    contents.on('did-start-navigation', (event) => {
      if (event.isMainFrame) void applyGeolocationEmulation(contents)
    })

    contents.on('did-navigate', () => void applyGeolocationEmulation(contents))

    contents.on('did-start-loading', () => this.syncNavigationState({ isLoading: true }))
    contents.on('did-stop-loading', () => this.syncNavigationState({ isLoading: false }))

    contents.on('did-navigate', (_event, url) => {
      this.recordVisit(url)
      this.syncNavigationState({ error: null, title: getHostname(url) })
    })

    contents.on('did-navigate-in-page', (_event, url, isMainFrame) => {
      if (!isMainFrame) return
      this.recordVisit(url)
      this.syncNavigationState()
    })

    contents.on('page-title-updated', (_event, title) => {
      if (this.currentHistoryId) historyRepository.updateTitle(this.currentHistoryId, title)
      this.patchState({ title })
    })

    contents.on(
      'did-fail-load',
      (_event, errorCode, errorDescription, validatedURL, isMainFrame) => {
        // -3 is ABORTED, which is what a user-initiated stop or a redirect looks like.
        if (!isMainFrame || errorCode === -3) return
        this.syncNavigationState({
          isLoading: false,
          error: `${errorDescription || 'Load failed'} — ${getHostname(validatedURL)}`,
        })
      }
    )

    contents.on('render-process-gone', () => {
      this.patchState({ isLoading: false, error: 'The page crashed. Reload to try again.' })
    })

    // No tabs and no extra windows: `target="_blank"` loads in place, and anything that
    // is not plain web content is handed to the operating system.
    contents.setWindowOpenHandler(({ url }) => {
      if (isNavigableUrl(url)) void contents.loadURL(url)
      else void shell.openExternal(url)
      return { action: 'deny' }
    })

    contents.on('will-navigate', (event, url) => {
      if (isNavigableUrl(url)) return
      event.preventDefault()
      void shell.openExternal(url)
    })

    // Never let a website attach a preload or re-enable node integration.
    contents.on('will-attach-webview', (event) => event.preventDefault())
  }
}
