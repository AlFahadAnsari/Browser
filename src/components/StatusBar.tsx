import { AnimatePresence, motion } from 'framer-motion'
import { LuGlobe, LuMapPin, LuTriangleAlert } from 'react-icons/lu'
import location from '@/config/location'
import { Spinner } from '@/components/ui/Spinner'
import { useBrowser } from '@/hooks/useBrowser'
import { prettifyUrl } from '@/utils/url'

/** Bottom bar: the URL on screen, the built-in location, and the loading indicator. */
export const StatusBar = () => {
  const { state } = useBrowser()

  const label = state.url ? prettifyUrl(state.url) : 'Ready'

  return (
    <footer className="flex h-7 shrink-0 items-center gap-3 border-t border-app-border bg-app-surface px-3 text-[11px] text-app-muted">
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        {state.error ? (
          <LuTriangleAlert aria-hidden="true" className="shrink-0 text-app-danger" />
        ) : (
          <LuGlobe aria-hidden="true" className="shrink-0" />
        )}
        <span
          className={state.error ? 'truncate text-app-danger' : 'truncate'}
          title={state.error ?? state.url}
        >
          {state.error ?? label}
        </span>
      </span>

      <AnimatePresence initial={false}>
        {state.isLoading && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="flex shrink-0 items-center gap-1.5 text-app-accent"
          >
            <Spinner />
            Loading…
          </motion.span>
        )}
      </AnimatePresence>

      <span
        className="flex shrink-0 items-center gap-1.5 border-l border-app-border pl-3"
        title={`Built-in location: ${location.latitude}, ${location.longitude} (±${location.accuracy} m) · ${location.timezone} · ${location.locale}`}
      >
        <LuMapPin aria-hidden="true" className="text-app-accent" />
        {location.name}, {location.area}, {location.city}
      </span>
    </footer>
  )
}
