import type { GeoBrowserApi } from '@/types/api'

/**
 * Single accessor for the preload bridge.
 *
 * Every service goes through here, so `window.geoBrowser` appears exactly once in the
 * renderer and a missing bridge fails loudly instead of throwing "undefined" deep in the UI.
 */
export const bridge = (): GeoBrowserApi => {
  const api = window.geoBrowser
  if (!api) throw new Error('GeoBrowser bridge unavailable — the preload script did not load.')
  return api
}
