import type { HistoryEntry } from '@/types/history'
import { historyStore } from '@/store/historyStore'
import { bridge } from './bridge'

const apply = (entries: HistoryEntry[]): HistoryEntry[] => {
  historyStore.setState({ entries, loaded: true })
  return entries
}

export const historyService = {
  /** Loads the persisted history and keeps it in sync with the main process. */
  init(): () => void {
    void bridge().history.list().then(apply)
    return bridge().history.onChanged(apply)
  },

  async refresh(): Promise<void> {
    apply(await bridge().history.list())
  },

  async remove(id: string): Promise<void> {
    apply(await bridge().history.remove(id))
  },

  async clear(): Promise<void> {
    apply(await bridge().history.clear())
  },
}
