import { useCallback } from 'react'
import type { ThemeMode } from '@/types/settings'
import { settingsStore } from '@/store/settingsStore'
import { settingsService } from '@/services/settingsService'
import { useStore } from './useStore'

export interface UseThemeResult {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggle: () => void
}

export const useTheme = (): UseThemeResult => {
  const { theme } = useStore(settingsStore)

  const setTheme = useCallback((next: ThemeMode) => {
    void settingsService.setTheme(next)
  }, [])

  const toggle = useCallback(() => {
    void settingsService.setTheme(settingsStore.getState().theme === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, setTheme, toggle }
}
