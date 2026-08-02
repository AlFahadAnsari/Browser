/** Every route in the application. There are only four. */
export const ROUTES = {
  home: '/',
  browse: '/browse',
  history: '/history',
  settings: '/settings',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
