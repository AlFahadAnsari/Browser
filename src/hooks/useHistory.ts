import { useCallback, useMemo, useState } from 'react'
import type { HistoryEntry } from '@/types/history'
import { historyStore } from '@/store/historyStore'
import { historyService } from '@/services/historyService'
import { getHostname } from '@/utils/url'
import { useStore } from './useStore'

export interface UseHistoryResult {
  /** Entries matching the current query, newest first. */
  entries: HistoryEntry[]
  /** Total number of stored entries, ignoring the query. */
  total: number
  loaded: boolean
  query: string
  setQuery: (query: string) => void
  remove: (id: string) => void
  clear: () => void
}

const matches = (entry: HistoryEntry, needle: string): boolean =>
  entry.title.toLowerCase().includes(needle) ||
  entry.url.toLowerCase().includes(needle) ||
  getHostname(entry.url).toLowerCase().includes(needle) ||
  entry.visitDate.toLowerCase().includes(needle)

export const useHistory = (): UseHistoryResult => {
  const { entries, loaded } = useStore(historyStore)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter((entry) => matches(entry, needle))
  }, [entries, query])

  const remove = useCallback((id: string) => {
    void historyService.remove(id)
  }, [])

  const clear = useCallback(() => {
    void historyService.clear()
  }, [])

  return { entries: filtered, total: entries.length, loaded, query, setQuery, remove, clear }
}

/** The most recent visits, de-duplicated by URL — used by the Home page. */
export const useRecentHistory = (limit = 8): HistoryEntry[] => {
  const { entries } = useStore(historyStore)

  return useMemo(() => {
    const seen = new Set<string>()
    const recent: HistoryEntry[] = []

    for (const entry of entries) {
      if (seen.has(entry.url)) continue
      seen.add(entry.url)
      recent.push(entry)
      if (recent.length === limit) break
    }

    return recent
  }, [entries, limit])
}
