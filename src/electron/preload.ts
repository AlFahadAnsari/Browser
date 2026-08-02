import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { GeoBrowserApi, Unsubscribe } from '@/types/api'
import type { BrowserState, ViewBounds } from '@/types/browser'
import type { HistoryEntry } from '@/types/history'
import type { AppSettings, ThemeMode } from '@/types/settings'
import { IpcChannel } from '@/types/ipc'

/**
 * The only bridge between the renderer and the main process.
 *
 * Context isolation is on and `ipcRenderer` itself is never exposed — the renderer can
 * only call this fixed set of functions, on this fixed set of channels.
 */

const subscribe = <T>(channel: string, listener: (payload: T) => void): Unsubscribe => {
  const handler = (_event: IpcRendererEvent, payload: T): void => listener(payload)
  ipcRenderer.on(channel, handler)
  return () => {
    ipcRenderer.removeListener(channel, handler)
  }
}

const api: GeoBrowserApi = {
  browser: {
    navigate: (input: string): Promise<BrowserState> =>
      ipcRenderer.invoke(IpcChannel.BrowserNavigate, input),
    back: (): Promise<BrowserState> => ipcRenderer.invoke(IpcChannel.BrowserBack),
    forward: (): Promise<BrowserState> => ipcRenderer.invoke(IpcChannel.BrowserForward),
    reload: (): Promise<BrowserState> => ipcRenderer.invoke(IpcChannel.BrowserReload),
    stop: (): Promise<BrowserState> => ipcRenderer.invoke(IpcChannel.BrowserStop),
    setBounds: (bounds: ViewBounds): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.BrowserSetBounds, bounds),
    setVisible: (visible: boolean): Promise<void> =>
      ipcRenderer.invoke(IpcChannel.BrowserSetVisible, visible),
    getState: (): Promise<BrowserState> => ipcRenderer.invoke(IpcChannel.BrowserGetState),
    onStateChanged: (listener: (state: BrowserState) => void): Unsubscribe =>
      subscribe<BrowserState>(IpcChannel.BrowserStateChanged, listener),
  },

  history: {
    list: (): Promise<HistoryEntry[]> => ipcRenderer.invoke(IpcChannel.HistoryList),
    remove: (id: string): Promise<HistoryEntry[]> =>
      ipcRenderer.invoke(IpcChannel.HistoryRemove, id),
    clear: (): Promise<HistoryEntry[]> => ipcRenderer.invoke(IpcChannel.HistoryClear),
    onChanged: (listener: (entries: HistoryEntry[]) => void): Unsubscribe =>
      subscribe<HistoryEntry[]>(IpcChannel.HistoryChanged, listener),
  },

  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke(IpcChannel.SettingsGet),
    setTheme: (theme: ThemeMode): Promise<AppSettings> =>
      ipcRenderer.invoke(IpcChannel.SettingsSetTheme, theme),
  },
}

contextBridge.exposeInMainWorld('geoBrowser', api)
