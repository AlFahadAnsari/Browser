/** A single visited page, persisted with electron-store. */
export interface HistoryEntry {
  /** Stable unique id, used for deletion. */
  id: string
  /** Document title at the time of the visit (falls back to the hostname). */
  title: string
  /** Fully qualified URL that was loaded. */
  url: string
  /** Visit timestamp, epoch milliseconds. */
  visitedAt: number
  /** Local visit date, pre-formatted for the configured locale (e.g. "03/08/2026"). */
  visitDate: string
  /** Local visit time, pre-formatted for the configured locale (e.g. "12:45 pm"). */
  visitTime: string
}
