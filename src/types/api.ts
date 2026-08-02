import type { BrowserState, ViewBounds } from '@/types/browser'
import type { HistoryEntry } from '@/types/history'
import type { AppSettings, ThemeMode } from '@/types/settings'

/** Unsubscribe function returned by every event subscription on the bridge. */
export type Unsubscribe = () => void

export interface BrowserApi {
  /** Navigate the website view. Accepts a URL, a bare domain, or a search term. */
  navigate(input: string): Promise<BrowserState>
  back(): Promise<BrowserState>
  forward(): Promise<BrowserState>
  reload(): Promise<BrowserState>
  stop(): Promise<BrowserState>
  /** Position the website view inside the window chrome. */
  setBounds(bounds: ViewBounds): Promise<void>
  /** Show or hide the website view (hidden while on Home / History / Settings). */
  setVisible(visible: boolean): Promise<void>
  getState(): Promise<BrowserState>
  onStateChanged(listener: (state: BrowserState) => void): Unsubscribe
}

export interface HistoryApi {
  list(): Promise<HistoryEntry[]>
  remove(id: string): Promise<HistoryEntry[]>
  clear(): Promise<HistoryEntry[]>
  onChanged(listener: (entries: HistoryEntry[]) => void): Unsubscribe
}

export interface SettingsApi {
  get(): Promise<AppSettings>
  setTheme(theme: ThemeMode): Promise<AppSettings>
}

/**
 * The complete, frozen surface exposed to the renderer as `window.geoBrowser`.
 *
 * The built-in location is deliberately absent: it is a compile-time constant that the
 * renderer imports straight from `@/config/location`, so it costs no IPC and keeps the
 * preload bundles dependency-free (a hard requirement for sandboxed preloads, which cannot
 * `require` sibling chunks).
 */
export interface GeoBrowserApi {
  browser: BrowserApi
  history: HistoryApi
  settings: SettingsApi
}
