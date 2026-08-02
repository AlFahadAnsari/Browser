import type { HistoryEntry } from '@/types/history'
import { createStore } from './createStore'

export interface HistoryStoreState {
  entries: HistoryEntry[]
  loaded: boolean
}

/** Renderer-side cache of the persisted history, refreshed whenever main reports a change. */
export const historyStore = createStore<HistoryStoreState>({ entries: [], loaded: false })
