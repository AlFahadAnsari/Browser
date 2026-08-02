import { Outlet } from 'react-router-dom'
import { StatusBar } from '@/components/StatusBar'
import { TopBar } from '@/components/TopBar'

/**
 * Fixed application frame: top bar, the page area, and the status bar.
 * The website `WebContentsView` is positioned by the main process over the page area.
 */
export const AppShell = () => (
  <div className="flex h-full flex-col overflow-hidden bg-app-bg">
    <TopBar />
    <main className="relative min-h-0 flex-1 overflow-hidden">
      <Outlet />
    </main>
    <StatusBar />
  </div>
)
