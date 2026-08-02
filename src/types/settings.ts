export type ThemeMode = 'light' | 'dark'

/** Everything the user is allowed to configure. Deliberately tiny. */
export interface AppSettings {
  theme: ThemeMode
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
}
