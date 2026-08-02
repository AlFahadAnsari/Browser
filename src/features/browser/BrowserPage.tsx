import { AnimatePresence, motion } from 'framer-motion'
import { LuGlobe, LuRotateCw, LuTriangleAlert } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBrowser } from '@/hooks/useBrowser'
import { useWebsiteViewport } from '@/hooks/useWebsiteViewport'
import { getHostname } from '@/utils/url'

/**
 * The website area.
 *
 * This component renders (almost) nothing: it reserves the rectangle that the native
 * `WebContentsView` is placed over. The overlays below are only shown when the native view
 * is deliberately hidden — before the first navigation, or after a failed load.
 */
export const BrowserPage = () => {
  const { state, reloadOrStop } = useBrowser()

  const hasPage = state.url.length > 0
  const showOverlay = !hasPage || state.error !== null
  const viewportRef = useWebsiteViewport(!showOverlay)

  return (
    <div ref={viewportRef} className="relative h-full w-full bg-app-bg">
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex items-center justify-center bg-app-bg"
          >
            {state.error ? (
              <EmptyState
                icon={<LuTriangleAlert className="text-app-danger" />}
                title={`Can't reach ${getHostname(state.url) || 'this site'}`}
                description={state.error}
                action={
                  <Button variant="secondary" onClick={reloadOrStop}>
                    <LuRotateCw aria-hidden="true" />
                    Try again
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<LuGlobe />}
                title="Nothing loaded yet"
                description="Type a website address in the bar above and press Go."
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
