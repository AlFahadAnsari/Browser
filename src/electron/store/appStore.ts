import Store from 'electron-store'
import type { HistoryEntry } from '@/types/history'
import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings'

export interface AppStoreSchema {
  history: HistoryEntry[]
  settings: AppSettings
}

/**
 * The one and only persistence layer: a JSON file managed by electron-store.
 * No database, no migrations to babysit.
 */
export const appStore = new Store<AppStoreSchema>({
  name: 'geobrowser',
  defaults: {
    history: [],
    settings: DEFAULT_SETTINGS,
  },
  clearInvalidConfig: true,
})
