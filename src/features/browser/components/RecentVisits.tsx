import { motion } from 'framer-motion'
import { LuArrowUpRight, LuGlobe } from 'react-icons/lu'
import type { HistoryEntry } from '@/types/history'
import { getHostname } from '@/utils/url'

export interface RecentVisitsProps {
  entries: HistoryEntry[]
  onOpen: (url: string) => void
}

/** Compact "pick up where you left off" grid shown on the Home page. */
export const RecentVisits = ({ entries, onOpen }: RecentVisitsProps) => {
  if (entries.length === 0) {
    return (
      <p className="text-center text-[13px] text-app-muted">Sites you visit will show up here.</p>
    )
  }

  return (
    <section aria-labelledby="recent-heading" className="w-full space-y-3">
      <h2
        id="recent-heading"
        className="text-[11px] font-medium uppercase tracking-wider text-app-muted"
      >
        Recent
      </h2>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entries.map((entry, index) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.2) }}
          >
            <button
              type="button"
              onClick={() => onOpen(entry.url)}
              className="group flex w-full items-center gap-3 rounded-xl bg-app-surface px-3 py-2.5 text-left ring-1 ring-app-border transition-colors duration-150 hover:bg-app-surface-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-2 text-app-muted">
                <LuGlobe aria-hidden="true" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-app-fg">
                  {entry.title}
                </span>
                <span className="block truncate text-[11px] text-app-muted">
                  {getHostname(entry.url)} · {entry.visitTime}
                </span>
              </span>

              <LuArrowUpRight
                aria-hidden="true"
                className="shrink-0 text-app-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              />
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
