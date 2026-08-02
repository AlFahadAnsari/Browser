import location from '@/config/location'
import type { HistoryEntry } from '@/types/history'

const dateFormatter = new Intl.DateTimeFormat(location.locale, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: location.timezone,
})

const timeFormatter = new Intl.DateTimeFormat(location.locale, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: location.timezone,
})

const dayFormatter = new Intl.DateTimeFormat(location.locale, {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: location.timezone,
})

/** "03 Aug 2026" — always rendered in the configured timezone/locale. */
export const formatVisitDate = (timestamp: number): string => dateFormatter.format(timestamp)

/** "12:45 pm" — always rendered in the configured timezone/locale. */
export const formatVisitTime = (timestamp: number): string => timeFormatter.format(timestamp)

/** "Monday, 03 August 2026" — used as the history day separator. */
export const formatDayHeading = (timestamp: number): string => dayFormatter.format(timestamp)

/** Stable key used to group history entries into days. */
export const getDayKey = (timestamp: number): string => dateFormatter.format(timestamp)

/** Groups entries (already sorted newest first) into day buckets, preserving order. */
export const groupByDay = (
  entries: readonly HistoryEntry[]
): Array<{ key: string; heading: string; entries: HistoryEntry[] }> => {
  const buckets: Array<{ key: string; heading: string; entries: HistoryEntry[] }> = []

  for (const entry of entries) {
    const key = getDayKey(entry.visitedAt)
    const last = buckets[buckets.length - 1]
    if (last && last.key === key) {
      last.entries.push(entry)
    } else {
      buckets.push({ key, heading: formatDayHeading(entry.visitedAt), entries: [entry] })
    }
  }

  return buckets
}
