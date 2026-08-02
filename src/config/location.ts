/**
 * The single source of truth for the geolocation that GeoBrowser reports to every website.
 *
 * This location is permanently built into the application: it is applied automatically at
 * startup, it is never chosen, edited or imported by the user, and there is no UI for it.
 * Changing the values in this file is the only supported way to change the location the
 * application reports.
 *
 * It is consumed by:
 *  - the main process (Chromium geolocation + timezone + locale emulation)
 *  - the website preload script (navigator.geolocation safety net)
 *  - the renderer (status bar label)
 */
export interface LocationConfig {
  /** Human readable label for the place, shown in the UI. */
  readonly name: string
  /** Neighbourhood / locality. */
  readonly area: string
  readonly city: string
  readonly state: string
  readonly country: string
  /** Decimal degrees, WGS84. */
  readonly latitude: number
  /** Decimal degrees, WGS84. */
  readonly longitude: number
  /** Reported horizontal accuracy in metres. */
  readonly accuracy: number
  /** IANA timezone id, e.g. "Asia/Kolkata". */
  readonly timezone: string
  /** BCP 47 tag used for `navigator.language`. */
  readonly language: string
  /** BCP 47 tag used for Chromium's locale / `Accept-Language` emulation. */
  readonly locale: string
}

const location: LocationConfig = {
  name: 'Zoo Media',
  area: 'Prabhadevi',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  latitude: 19.0060953,
  longitude: 72.8240398,
  accuracy: 20,
  timezone: 'Asia/Kolkata',
  language: 'en-IN',
  locale: 'en-IN',
}

export default location
