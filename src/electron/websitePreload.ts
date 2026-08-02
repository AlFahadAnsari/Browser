import { contextBridge } from 'electron'
import location from '@/config/location'

/**
 * Preload for the website view.
 *
 * It exposes **no** IPC surface to web content. Its only job is to make the built-in
 * location deterministic from the very first line of page script:
 *
 *  - `navigator.geolocation` always resolves to the configured coordinates,
 *  - `navigator.language` / `languages` report the configured language,
 *  - the geolocation permission always reads as `granted`, so nothing ever prompts,
 *  - `Intl` and every `toLocale*` helper default to the configured locale.
 *
 * Chromium's own emulation (attached from the main process over CDP) covers the same
 * ground natively, but it is applied asynchronously and a fresh renderer process can start
 * parsing before it lands. This patch runs in the page's main world via
 * `contextBridge.executeInMainWorld` before any page script, so the two together leave no
 * window in which a site could observe the host machine's real settings.
 */

interface LocationPayload {
  latitude: number
  longitude: number
  accuracy: number
  language: string
  locale: string
}

const payload: LocationPayload = {
  latitude: location.latitude,
  longitude: location.longitude,
  accuracy: location.accuracy,
  language: location.language,
  locale: location.locale,
}

/**
 * Serialized into the page's main world — it must be fully self-contained and may not
 * close over anything from this module.
 */
const installLocationEmulation = (config: LocationPayload): void => {
  // ------------------------------------------------------------------ geolocation
  const buildPosition = (): GeolocationPosition => {
    const snapshot = {
      latitude: config.latitude,
      longitude: config.longitude,
      accuracy: config.accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    }

    const coords = { ...snapshot, toJSON: () => snapshot }
    const timestamp = Date.now()

    return {
      coords,
      timestamp,
      toJSON: () => ({ coords: snapshot, timestamp }),
    } as unknown as GeolocationPosition
  }

  let watchId = 0

  const geolocation: Geolocation = {
    getCurrentPosition(onSuccess: PositionCallback): void {
      if (typeof onSuccess === 'function') {
        Promise.resolve().then(() => onSuccess(buildPosition()))
      }
    },
    watchPosition(onSuccess: PositionCallback): number {
      watchId += 1
      if (typeof onSuccess === 'function') {
        Promise.resolve().then(() => onSuccess(buildPosition()))
      }
      return watchId
    },
    clearWatch(): void {
      /* the position never changes, so there is nothing to stop */
    },
  }

  const define = (target: object, property: string, get: () => unknown): void => {
    try {
      Object.defineProperty(target, property, { configurable: true, enumerable: true, get })
    } catch {
      /* the page froze this object — Chromium's native emulation still applies */
    }
  }

  define(navigator, 'geolocation', () => geolocation)

  // -------------------------------------------------------------------- language
  const languages = Object.freeze([config.language, config.language.split('-')[0] ?? 'en'])
  define(navigator, 'language', () => config.language)
  define(navigator, 'languages', () => languages)

  // Geolocation is granted permanently and silently — never prompt the user.
  const permissions = navigator.permissions
  if (permissions && typeof permissions.query === 'function') {
    const originalQuery = permissions.query.bind(permissions)
    permissions.query = (descriptor: PermissionDescriptor): Promise<PermissionStatus> => {
      if (descriptor && descriptor.name === 'geolocation') {
        return Promise.resolve({
          name: 'geolocation',
          state: 'granted',
          onchange: null,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        } as unknown as PermissionStatus)
      }
      return originalQuery(descriptor)
    }
  }

  // ----------------------------------------------------------------------- locale
  // Anything that formats "for the user's locale" without naming one gets the
  // configured locale instead of the host machine's.
  type AnyConstructor = new (...args: unknown[]) => unknown

  const withDefaultLocale = (Original: AnyConstructor): AnyConstructor => {
    const Wrapped = function (this: unknown, locales?: unknown, options?: unknown): unknown {
      return new Original(locales === undefined ? config.locale : locales, options)
    } as unknown as AnyConstructor

    Wrapped.prototype = Original.prototype
    // Carry over statics such as `supportedLocalesOf`.
    Object.setPrototypeOf(Wrapped, Original)
    return Wrapped
  }

  const intl = Intl as unknown as Record<string, AnyConstructor | undefined>
  for (const name of [
    'Collator',
    'DateTimeFormat',
    'DisplayNames',
    'DurationFormat',
    'ListFormat',
    'NumberFormat',
    'PluralRules',
    'RelativeTimeFormat',
    'Segmenter',
  ]) {
    const Original = intl[name]
    if (typeof Original !== 'function') continue
    try {
      intl[name] = withDefaultLocale(Original)
    } catch {
      /* frozen Intl — the CDP locale override remains the fallback */
    }
  }

  const patchLocaleMethod = (prototype: object | undefined, method: string): void => {
    if (!prototype) return
    const original = (prototype as Record<string, unknown>)[method]
    if (typeof original !== 'function') return

    try {
      Object.defineProperty(prototype, method, {
        configurable: true,
        writable: true,
        value: function (this: unknown, locales?: unknown, ...rest: unknown[]): unknown {
          return (original as (...args: unknown[]) => unknown).call(
            this,
            locales === undefined ? config.locale : locales,
            ...rest
          )
        },
      })
    } catch {
      /* frozen prototype — nothing further to do */
    }
  }

  patchLocaleMethod(Date.prototype, 'toLocaleString')
  patchLocaleMethod(Date.prototype, 'toLocaleDateString')
  patchLocaleMethod(Date.prototype, 'toLocaleTimeString')
  patchLocaleMethod(Number.prototype, 'toLocaleString')
  patchLocaleMethod(Array.prototype, 'toLocaleString')
  patchLocaleMethod(String.prototype, 'localeCompare')
  patchLocaleMethod(typeof BigInt === 'function' ? BigInt.prototype : undefined, 'toLocaleString')
}

if (typeof contextBridge.executeInMainWorld === 'function') {
  contextBridge.executeInMainWorld({ func: installLocationEmulation, args: [payload] })
}
