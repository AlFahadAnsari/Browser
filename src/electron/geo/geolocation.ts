import { app, type Session, type WebContents } from 'electron'
import location from '@/config/location'

/**
 * Built-in geolocation.
 *
 * The location from `src/config/location.ts` is applied in three independent layers so a
 * website always sees the configured place, with no user interaction at any point:
 *
 *  1. Process level  — `TZ` and Chromium's `--lang` are set before the app is ready, so the
 *                      whole engine boots in Asia/Kolkata / en-IN.
 *  2. Session level  — geolocation permission requests/checks are auto-granted, and
 *                      `Accept-Language` is pinned to the configured locale.
 *  3. Page level     — Chromium's own emulation (CDP `Emulation.setGeolocationOverride`,
 *                      `setTimezoneOverride`, `setLocaleOverride`) is attached to the website
 *                      view, which is what `navigator.geolocation` reads from natively.
 *
 * A fourth safety net lives in `websitePreload.ts`, which patches `navigator.geolocation`
 * directly in case the debugger transport is ever unavailable.
 */

/** Must run before `app.whenReady()` — Chromium reads these at startup. */
export const configureProcessLocale = (): void => {
  process.env.TZ = location.timezone
  process.env.LANG ??= `${location.locale.replace('-', '_')}.UTF-8`
  app.commandLine.appendSwitch('lang', location.locale)
}

/** Auto-grants geolocation (and nothing else) and pins the language headers. */
export const configureSessionGeolocation = (session: Session): void => {
  const acceptLanguages = `${location.locale},${location.locale.split('-')[0] ?? 'en'};q=0.9`
  session.setUserAgent(session.getUserAgent(), acceptLanguages)

  session.setPermissionRequestHandler((_contents, permission, callback) => {
    callback(permission === 'geolocation')
  })

  session.setPermissionCheckHandler((_contents, permission) => permission === 'geolocation')

  session.setDevicePermissionHandler(() => false)
}

/**
 * Attaches Chromium's emulation overrides to a `WebContents`.
 * Safe to call repeatedly; re-applying after a crash/reload is a no-op if already attached.
 */
export const applyGeolocationEmulation = async (contents: WebContents): Promise<void> => {
  const { debugger: cdp } = contents

  try {
    if (!cdp.isAttached()) cdp.attach('1.3')
  } catch (error) {
    console.error('[geolocation] unable to attach debugger, using preload fallback only', error)
    return
  }

  try {
    await cdp.sendCommand('Emulation.setGeolocationOverride', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    })
    await cdp.sendCommand('Emulation.setTimezoneOverride', { timezoneId: location.timezone })
    await cdp.sendCommand('Emulation.setLocaleOverride', { locale: location.locale })
  } catch (error) {
    console.error('[geolocation] emulation command failed', error)
  }
}

/** Detaches the debugger, e.g. while the window is being destroyed. */
export const releaseGeolocationEmulation = (contents: WebContents): void => {
  try {
    if (contents.debugger.isAttached()) contents.debugger.detach()
  } catch {
    /* the contents are already gone — nothing to release */
  }
}
