import { session, type Session } from 'electron'
import { configureSessionGeolocation } from '@/electron/geo/geolocation'

/** Websites live in their own persistent partition, isolated from the app UI session. */
export const WEBSITE_PARTITION = 'persist:geobrowser-websites'

let configured: Session | null = null

/**
 * Builds a clean, Chrome-looking browsing session:
 *  - the Electron/app tokens are stripped from the user agent so sites don't serve
 *    degraded pages,
 *  - the spell checker is disabled (it downloads dictionaries and costs memory),
 *  - geolocation permission + language headers come from the built-in location config.
 */
export const getWebsiteSession = (): Session => {
  if (configured) return configured

  const websiteSession = session.fromPartition(WEBSITE_PARTITION)

  const cleanUserAgent = websiteSession
    .getUserAgent()
    .replace(/\sGeoBrowser\/[^\s]+/i, '')
    .replace(/\sElectron\/[^\s]+/i, '')
    .trim()

  websiteSession.setUserAgent(cleanUserAgent)
  websiteSession.setSpellCheckerEnabled(false)

  configureSessionGeolocation(websiteSession)

  configured = websiteSession
  return websiteSession
}
