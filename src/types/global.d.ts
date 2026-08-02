import type { GeoBrowserApi } from '@/types/api'

declare global {
  interface Window {
    readonly geoBrowser: GeoBrowserApi
  }
}

export {}
