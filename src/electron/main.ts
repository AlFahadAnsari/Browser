import { app, BrowserWindow } from 'electron'
import { configureProcessLocale } from '@/electron/geo/geolocation'
import { registerIpc } from '@/electron/ipc/registerIpc'
import { settingsRepository } from '@/electron/store/settingsRepository'
import { createMainWindow, type MainWindowHandles } from '@/electron/windows/mainWindow'

/**
 * GeoBrowser — a single-window website viewer with a permanently configured geolocation.
 *
 * The locale/timezone switches must be applied before Chromium boots, so this runs at
 * module scope rather than inside `whenReady`.
 */
configureProcessLocale()

// One window only: a second launch focuses the existing one.
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let handles: MainWindowHandles | null = null
let disposeIpc: (() => void) | null = null

const launch = (): void => {
  const settings = settingsRepository.applyPersistedTheme()
  handles = createMainWindow(settings.theme)
  disposeIpc = registerIpc(handles)

  handles.window.on('closed', () => {
    disposeIpc?.()
    disposeIpc = null
    handles = null
  })
}

app.on('second-instance', () => {
  const window = handles?.window
  if (!window) return
  if (window.isMinimized()) window.restore()
  window.focus()
})

// Belt and braces: reject any attempt to create a web contents with unsafe preferences.
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-attach-webview', (event) => event.preventDefault())
})

void app.whenReady().then(() => {
  app.setAppUserModelId('com.zoomedia.geobrowser')
  launch()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) launch()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
