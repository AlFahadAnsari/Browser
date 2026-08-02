import { createHashRouter, Navigate, type RouteObject } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { BrowserPage } from '@/features/browser/BrowserPage'
import { HomePage } from '@/features/browser/HomePage'
import { HistoryPage } from '@/features/history/HistoryPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { ROUTES } from './routes'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.browse, element: <BrowserPage /> },
      { path: ROUTES.history, element: <HistoryPage /> },
      { path: ROUTES.settings, element: <SettingsPage /> },
      { path: '*', element: <Navigate to={ROUTES.home} replace /> },
    ],
  },
]

/** Hash routing: the renderer is served from `file://` in a packaged build. */
export const router = createHashRouter(routes)
