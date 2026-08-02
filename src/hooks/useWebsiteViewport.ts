import { useEffect, useRef } from 'react'
import type { ViewBounds } from '@/types/browser'
import { browserService } from '@/services/browserService'

/**
 * Binds a DOM element to the native website view.
 *
 * The element is an empty placeholder: it reserves the space in the React layout, and its
 * measured rectangle is forwarded to the main process, which positions the
 * `WebContentsView` exactly on top of it. The view is shown while the element is mounted
 * and `enabled`, and hidden as soon as it unmounts (Home / History / Settings).
 */
export const useWebsiteViewport = (enabled: boolean): React.RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null)
  const lastBounds = useRef<ViewBounds | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const publish = (): void => {
      const rect = element.getBoundingClientRect()
      const bounds: ViewBounds = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }

      const previous = lastBounds.current
      if (
        previous &&
        previous.x === bounds.x &&
        previous.y === bounds.y &&
        previous.width === bounds.width &&
        previous.height === bounds.height
      ) {
        return
      }

      lastBounds.current = bounds
      browserService.setBounds(bounds)
    }

    publish()

    const observer = new ResizeObserver(publish)
    observer.observe(element)
    window.addEventListener('resize', publish)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [])

  useEffect(() => {
    browserService.setVisible(enabled)
    return () => browserService.setVisible(false)
  }, [enabled])

  return ref
}
