import { NavLink, useLocation } from 'react-router-dom'
import {
  LuArrowLeft,
  LuArrowRight,
  LuHistory,
  LuHouse,
  LuRotateCw,
  LuSettings,
  LuX,
} from 'react-icons/lu'
import { AddressBar } from '@/components/AddressBar'
import { IconButton } from '@/components/ui/IconButton'
import { useBrowser } from '@/hooks/useBrowser'
import { ROUTES } from '@/app/routes'
import { cn } from '@/utils/cn'

const NAV_LINKS = [
  { to: ROUTES.home, label: 'Home', icon: <LuHouse /> },
  { to: ROUTES.history, label: 'History', icon: <LuHistory /> },
  { to: ROUTES.settings, label: 'Settings', icon: <LuSettings /> },
] as const

/** The only chrome above the website area: navigation controls plus the address bar. */
export const TopBar = () => {
  const { state, open, back, forward, reloadOrStop } = useBrowser()
  const { pathname } = useLocation()

  // Outside the website view the address bar starts empty rather than showing a stale URL.
  const currentUrl = pathname === ROUTES.browse ? state.url : ''

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-app-border bg-app-surface px-3">
      <div className="flex shrink-0 items-center gap-1">
        <IconButton
          label="Back"
          icon={<LuArrowLeft />}
          onClick={back}
          disabled={!state.canGoBack}
        />
        <IconButton
          label="Forward"
          icon={<LuArrowRight />}
          onClick={forward}
          disabled={!state.canGoForward}
        />
        <IconButton
          label={state.isLoading ? 'Stop' : 'Refresh'}
          icon={state.isLoading ? <LuX /> : <LuRotateCw />}
          onClick={reloadOrStop}
          disabled={!state.isLoading && !state.url}
        />
      </div>

      <AddressBar currentUrl={currentUrl} onSubmit={open} className="mx-1" />

      <nav
        aria-label="Application"
        className="ml-1 flex shrink-0 items-center gap-1 border-l border-app-border pl-2"
      >
        {NAV_LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} className="outline-none" tabIndex={-1}>
            {({ isActive }) => (
              <IconButton
                label={link.label}
                icon={link.icon}
                active={isActive}
                className={cn(isActive && 'text-app-accent')}
              />
            )}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
