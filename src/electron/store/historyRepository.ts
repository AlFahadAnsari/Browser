import { randomUUID } from 'node:crypto'
import type { HistoryEntry } from '@/types/history'
import { formatVisitDate, formatVisitTime } from '@/utils/datetime'
import { getHostname, isRecordableUrl } from '@/utils/url'
import { appStore } from './appStore'

/** Upper bound so the JSON file stays small and the History page stays fast. */
const MAX_ENTRIES = 1000

/** Two visits to the same URL within this window are treated as one. */
const DEDUPE_WINDOW_MS = 30_000

type ChangeListener = (entries: HistoryEntry[]) => void

const listeners = new Set<ChangeListener>()

const read = (): HistoryEntry[] => appStore.get('history', [])

const write = (entries: HistoryEntry[]): HistoryEntry[] => {
  const trimmed = entries.slice(0, MAX_ENTRIES)
  appStore.set('history', trimmed)
  for (const listener of listeners) listener(trimmed)
  return trimmed
}

export const historyRepository = {
  /** Newest first. */
  list(): HistoryEntry[] {
    return read()
  },

  /**
   * Records a visit, collapsing rapid repeats of the same URL (redirects, in-page
   * navigations, reloads) into the existing entry instead of creating duplicates.
   * Returns the id of the entry representing this visit, or null if not recordable.
   */
  record(url: string, title: string): string | null {
    if (!isRecordableUrl(url)) return null

    const entries = read()
    const now = Date.now()
    const resolvedTitle = title.trim() || getHostname(url)
    const head = entries[0]

    if (head && head.url === url && now - head.visitedAt < DEDUPE_WINDOW_MS) {
      const updated: HistoryEntry = { ...head, title: resolvedTitle, visitedAt: now }
      updated.visitDate = formatVisitDate(now)
      updated.visitTime = formatVisitTime(now)
      write([updated, ...entries.slice(1)])
      return updated.id
    }

    const entry: HistoryEntry = {
      id: randomUUID(),
      url,
      title: resolvedTitle,
      visitedAt: now,
      visitDate: formatVisitDate(now),
      visitTime: formatVisitTime(now),
    }

    write([entry, ...entries])
    return entry.id
  },

  /** Updates the title of an already recorded visit (titles arrive after navigation). */
  updateTitle(id: string, title: string): void {
    const resolved = title.trim()
    if (!resolved) return

    const entries = read()
    const index = entries.findIndex((entry) => entry.id === id)
    const existing = entries[index]
    if (!existing || existing.title === resolved) return

    const next = entries.slice()
    next[index] = { ...existing, title: resolved }
    write(next)
  },

  remove(id: string): HistoryEntry[] {
    return write(read().filter((entry) => entry.id !== id))
  },

  clear(): HistoryEntry[] {
    return write([])
  },

  onChanged(listener: ChangeListener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
