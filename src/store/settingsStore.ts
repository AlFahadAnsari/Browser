import { DEFAULT_SETTINGS, type AppSettings } from '@/types/settings'
import { createStore } from './createStore'

export interface SettingsStoreState extends AppSettings {
  loaded: boolean
}

export const settingsStore = createStore<SettingsStoreState>({ ...DEFAULT_SETTINGS, loaded: false })
