/**
 * Address bar input resolution.
 *
 * Shared by the renderer (to preview what will happen) and the main process
 * (which performs the actual navigation), so both always agree.
 */

const SEARCH_ENDPOINT = 'https://www.google.com/search?q='

/** Schemes we are willing to load in the website view. */
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'about:'])

/** Matches "example.com", "sub.example.co.in", "localhost:3000", "127.0.0.1:8080". */
const HOST_LIKE =
  /^(?:localhost(?::\d{1,5})?|(?:\d{1,3}\.){3}\d{1,3}(?::\d{1,5})?|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d{1,5})?)(?:[/?#].*)?$/i

export type ResolvedKind = 'url' | 'search'

export interface ResolvedAddress {
  /** The URL that should be loaded. */
  href: string
  /** Whether the input was treated as an address or as a search query. */
  kind: ResolvedKind
}

/**
 * True for `https://…`, `about:blank`, `mailto:…` — but deliberately false for
 * `localhost:3000` and `example.com:8080`, where the colon introduces a port. Without the
 * lookahead those inputs parse as a URL whose scheme is `localhost:` / `example.com:`.
 */
const hasScheme = (value: string): boolean => /^[a-z][a-z0-9+.-]*:(?!\d)/i.test(value)

/**
 * Turns raw address bar input into a loadable URL.
 *
 * - "https://google.com"  -> as-is
 * - "google.com"          -> "https://google.com"
 * - "amazon.in/deals"     -> "https://amazon.in/deals"
 * - "localhost:5173"      -> "http://localhost:5173"
 * - "weather"             -> Google search
 */
export const resolveAddress = (rawInput: string): ResolvedAddress | null => {
  const input = rawInput.trim()
  if (input.length === 0) return null

  const search: ResolvedAddress = {
    href: SEARCH_ENDPOINT + encodeURIComponent(input),
    kind: 'search',
  }

  if (hasScheme(input)) {
    try {
      const parsed = new URL(input)
      // An unsupported scheme (file:, data:, javascript:…) is treated as a search term
      // rather than silently doing nothing.
      if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return search
      return { href: parsed.toString(), kind: 'url' }
    } catch {
      return search
    }
  }

  if (!/\s/.test(input) && HOST_LIKE.test(input)) {
    const isLocal = /^(localhost|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?(?:[/?#]|$)/i.test(input)
    try {
      const parsed = new URL(`${isLocal ? 'http' : 'https'}://${input}`)
      return { href: parsed.toString(), kind: 'url' }
    } catch {
      /* fall through to search */
    }
  }

  return search
}

/** `https://www.amazon.in/deals?x=1` -> `amazon.in` (used for history titles/labels). */
export const getHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./i, '')
  } catch {
    return url
  }
}

/** A compact, human friendly form of a URL for the status bar. */
export const prettifyUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname === '/' ? '' : parsed.pathname
    return `${parsed.hostname.replace(/^www\./i, '')}${path}${parsed.search}`
  } catch {
    return url
  }
}

/** Guards against loading anything other than regular web content. */
export const isNavigableUrl = (url: string): boolean => {
  try {
    return ALLOWED_PROTOCOLS.has(new URL(url).protocol)
  } catch {
    return false
  }
}

/** `about:blank` and empty strings should never be written to history. */
export const isRecordableUrl = (url: string): boolean =>
  url.length > 0 && /^https?:/i.test(url) && !url.startsWith('about:')
