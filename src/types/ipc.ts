/**
 * Channel names shared by the main process, the preload bridge and the renderer.
 * Keeping them in one typed module removes the "magic string" class of IPC bugs.
 */
export const IpcChannel = {
  // Browser view control (renderer -> main, invoke)
  BrowserNavigate: 'browser:navigate',
  BrowserBack: 'browser:back',
  BrowserForward: 'browser:forward',
  BrowserReload: 'browser:reload',
  BrowserStop: 'browser:stop',
  BrowserSetBounds: 'browser:set-bounds',
  BrowserSetVisible: 'browser:set-visible',
  BrowserGetState: 'browser:get-state',

  // Browser view state (main -> renderer, send)
  BrowserStateChanged: 'browser:state-changed',

  // History
  HistoryList: 'history:list',
  HistoryRemove: 'history:remove',
  HistoryClear: 'history:clear',
  HistoryChanged: 'history:changed',

  // Settings
  SettingsGet: 'settings:get',
  SettingsSetTheme: 'settings:set-theme',
} as const

export type IpcChannelName = (typeof IpcChannel)[keyof typeof IpcChannel]
