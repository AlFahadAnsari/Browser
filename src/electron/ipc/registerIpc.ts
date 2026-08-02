import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import type { BrowserState, ViewBounds } from '@/types/browser'
import type { HistoryEntry } from '@/types/history'
import type { AppSettings, ThemeMode } from '@/types/settings'
import { IpcChannel } from '@/types/ipc'
import { historyRepository } from '@/electron/store/historyRepository'
import { settingsRepository } from '@/electron/store/settingsRepository'
import { THEME_BACKGROUND, type MainWindowHandles } from '@/electron/windows/mainWindow'

const isViewBounds = (value: unknown): value is ViewBounds => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (['x', 'y', 'width', 'height'] as const).every(
    (key) => typeof candidate[key] === 'number' && Number.isFinite(candidate[key] as number)
  )
}

const isThemeMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark'

/**
 * Wires the renderer bridge to the main process.
 *
 * Every handler verifies that the call came from the application UI — website content runs
 * in a different session with a preload that has no IPC surface at all, but the check keeps
 * the invariant explicit and cheap.
 */
export const registerIpc = ({ window, websiteView }: MainWindowHandles): (() => void) => {
  const uiContents = window.webContents

  const fromUi = (event: IpcMainInvokeEvent): boolean => event.sender === uiContents

  const handle = <T>(channel: string, handler: (...args: unknown[]) => T): void => {
    ipcMain.handle(channel, (event, ...args) => {
      if (!fromUi(event)) throw new Error(`Rejected IPC "${channel}" from an untrusted sender`)
      return handler(...args)
    })
  }

  // ------------------------------------------------------------------ browser
  handle<Promise<BrowserState>>(IpcChannel.BrowserNavigate, (input) =>
    websiteView.navigate(typeof input === 'string' ? input : '')
  )
  handle<BrowserState>(IpcChannel.BrowserBack, () => websiteView.goBack())
  handle<BrowserState>(IpcChannel.BrowserForward, () => websiteView.goForward())
  handle<BrowserState>(IpcChannel.BrowserReload, () => websiteView.reload())
  handle<BrowserState>(IpcChannel.BrowserStop, () => websiteView.stop())
  handle<BrowserState>(IpcChannel.BrowserGetState, () => websiteView.getState())

  handle<void>(IpcChannel.BrowserSetBounds, (bounds) => {
    if (isViewBounds(bounds)) websiteView.setBounds(bounds)
  })

  handle<void>(IpcChannel.BrowserSetVisible, (visible) => {
    websiteView.setVisible(visible === true)
  })

  // ------------------------------------------------------------------ history
  handle<HistoryEntry[]>(IpcChannel.HistoryList, () => historyRepository.list())
  handle<HistoryEntry[]>(IpcChannel.HistoryRemove, (id) =>
    typeof id === 'string' ? historyRepository.remove(id) : historyRepository.list()
  )
  handle<HistoryEntry[]>(IpcChannel.HistoryClear, () => historyRepository.clear())

  // ----------------------------------------------------------------- settings
  handle<AppSettings>(IpcChannel.SettingsGet, () => settingsRepository.get())
  handle<AppSettings>(IpcChannel.SettingsSetTheme, (theme) => {
    if (!isThemeMode(theme)) return settingsRepository.get()
    const settings = settingsRepository.setTheme(theme)
    const background = THEME_BACKGROUND[settings.theme]
    window.setBackgroundColor(background)
    websiteView.setBackgroundColor(background)
    return settings
  })

  // ------------------------------------------------------- main -> renderer
  const send = (channel: string, payload: unknown): void => {
    if (!uiContents.isDestroyed()) uiContents.send(channel, payload)
  }

  const unsubscribeBrowser = websiteView.onStateChanged((state) =>
    send(IpcChannel.BrowserStateChanged, state)
  )
  const unsubscribeHistory = historyRepository.onChanged((entries) =>
    send(IpcChannel.HistoryChanged, entries)
  )

  return (): void => {
    unsubscribeBrowser()
    unsubscribeHistory()
    for (const channel of Object.values(IpcChannel)) ipcMain.removeHandler(channel)
  }
}
