/** Rectangle (CSS pixels, relative to the window content area) reserved for the website view. */
export interface ViewBounds {
  x: number
  y: number
  width: number
  height: number
}

/** Navigation state of the embedded website view, mirrored into the renderer. */
export interface BrowserState {
  url: string
  title: string
  canGoBack: boolean
  canGoForward: boolean
  isLoading: boolean
  /** Set when the last navigation failed, cleared on the next successful load. */
  error: string | null
}

export const INITIAL_BROWSER_STATE: BrowserState = {
  url: '',
  title: '',
  canGoBack: false,
  canGoForward: false,
  isLoading: false,
  error: null,
}
