import { useSyncExternalStore } from 'react'
import type { Store } from '@/store/createStore'

/** Subscribes a component to a store created by `createStore`. */
export const useStore = <T extends object>(store: Store<T>): T =>
  useSyncExternalStore(store.subscribe, store.getState, store.getState)
