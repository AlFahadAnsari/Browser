type Listener = () => void

export interface Store<T> {
  getState: () => T
  setState: (patch: Partial<T> | ((previous: T) => Partial<T>)) => void
  subscribe: (listener: Listener) => () => void
}

/**
 * A ~20 line observable store consumed with `useSyncExternalStore`.
 *
 * The app has three tiny slices of shared state; pulling in a state management library
 * for that would cost more bytes than it saves.
 */
export const createStore = <T extends object>(initialState: T): Store<T> => {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    getState: () => state,

    setState: (patch) => {
      const partial = typeof patch === 'function' ? patch(state) : patch
      const next = { ...state, ...partial }

      const changed = (Object.keys(next) as Array<keyof T>).some((key) => next[key] !== state[key])
      if (!changed) return

      state = next
      for (const listener of listeners) listener()
    },

    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
