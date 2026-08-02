import { INITIAL_BROWSER_STATE, type BrowserState } from '@/types/browser'
import { createStore } from './createStore'

/** Mirror of the website view's navigation state, kept in sync over IPC. */
export const browserStore = createStore<BrowserState>({ ...INITIAL_BROWSER_STATE })
