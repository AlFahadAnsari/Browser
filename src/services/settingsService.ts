import type { AppSettings, ThemeMode } from '@/types/settings'
import { settingsStore } from '@/store/settingsStore'
import { bridge } from './bridge'

/** Keeps the `dark` class on <html> in step with the persisted theme. */
const applyDocumentTheme = (theme: ThemeMode): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

const apply = (settings: AppSettings): AppSettings => {
  settingsStore.setState({ ...settings, loaded: true })
  applyDocumentTheme(settings.theme)
  return settings
}

export const settingsService = {
  /** Reads the persisted settings and applies the theme. Awaited before the first render. */
  async load(): Promise<void> {
    apply(await bridge().settings.get())
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    // Paint immediately, then persist — the toggle should never feel laggy.
    applyDocumentTheme(theme)
    apply(await bridge().settings.setTheme(theme))
  },
}
