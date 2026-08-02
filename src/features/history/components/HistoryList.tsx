import { AnimatePresence } from 'framer-motion'
import type { HistoryEntry } from '@/types/history'
import { groupByDay } from '@/utils/datetime'
import { HistoryItem } from './HistoryItem'

export interface HistoryListProps {
  entries: HistoryEntry[]
  onOpen: (url: string) => void
  onRemove: (id: string) => void
}

/** History grouped into days, newest first. */
export const HistoryList = ({ entries, onOpen, onRemove }: HistoryListProps) => (
  <div className="space-y-6">
    {groupByDay(entries).map((group) => (
      <section key={group.key} aria-label={group.heading}>
        <h2 className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-app-muted">
          {group.heading}
        </h2>
        <ul className="space-y-0.5">
          <AnimatePresence initial={false}>
            {group.entries.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} onOpen={onOpen} onRemove={onRemove} />
            ))}
          </AnimatePresence>
        </ul>
      </section>
    ))}
  </div>
)
