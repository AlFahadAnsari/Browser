import { nativeTheme } from 'electron'
import { DEFAULT_SETTINGS, type AppSettings, type ThemeMode } from '@/types/settings'
import { appStore } from './appStore'

export const settingsRepository = {
  get(): AppSettings {
    return { ...DEFAULT_SETTINGS, ...appStore.get('settings', DEFAULT_SETTINGS) }
  },

  setTheme(theme: ThemeMode): AppSettings {
    const next: AppSettings = { ...settingsRepository.get(), theme }
    appStore.set('settings', next)
    nativeTheme.themeSource = theme
    return next
  },

  /** Applies the persisted theme to Chromium so native surfaces match the UI. */
  applyPersistedTheme(): AppSettings {
    const settings = settingsRepository.get()
    nativeTheme.themeSource = settings.theme
    return settings
  },
}
