import { motion } from 'framer-motion'
import { LuGlobe, LuTrash2 } from 'react-icons/lu'
import type { HistoryEntry } from '@/types/history'
import { IconButton } from '@/components/ui/IconButton'
import { getHostname } from '@/utils/url'

export interface HistoryItemProps {
  entry: HistoryEntry
  onOpen: (url: string) => void
  onRemove: (id: string) => void
}

export const HistoryItem = ({ entry, onOpen, onRemove }: HistoryItemProps) => (
  <motion.li
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.16 } }}
    transition={{ duration: 0.18 }}
    className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-app-surface-2"
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-surface-2 text-app-muted">
      <LuGlobe aria-hidden="true" />
    </span>

    <button
      type="button"
      onClick={() => onOpen(entry.url)}
      title={entry.url}
      className="min-w-0 flex-1 text-left"
    >
      <span className="block truncate text-[13px] font-medium text-app-fg">{entry.title}</span>
      <span className="block truncate text-[11px] text-app-muted">{getHostname(entry.url)}</span>
    </button>

    <span className="hidden shrink-0 text-right text-[11px] text-app-muted sm:block">
      <span className="block">{entry.visitTime}</span>
      <span className="block">{entry.visitDate}</span>
    </span>

    <IconButton
      label={`Delete ${entry.title}`}
      icon={<LuTrash2 />}
      onClick={() => onRemove(entry.id)}
      className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-app-danger"
    />
  </motion.li>
)
