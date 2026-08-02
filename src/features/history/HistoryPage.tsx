import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuHistory, LuSearch, LuTrash2, LuX } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { useBrowser } from '@/hooks/useBrowser'
import { useHistory } from '@/hooks/useHistory'
import { HistoryList } from './components/HistoryList'

/** Browsing history: search, delete a single entry, clear everything. */
export const HistoryPage = () => {
  const { entries, total, query, setQuery, remove, clear } = useHistory()
  const { open } = useBrowser()
  const [confirmingClear, setConfirmingClear] = useState(false)

  const handleClear = (): void => {
    clear()
    setConfirmingClear(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="scroll-thin h-full overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="mr-auto text-lg font-semibold tracking-tight text-app-fg">History</h1>

          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl bg-app-surface-2 px-3 ring-1 ring-app-border focus-within:ring-2 focus-within:ring-app-accent/70 sm:max-w-xs">
            <LuSearch aria-hidden="true" className="shrink-0 text-[15px] text-app-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search history"
              aria-label="Search history"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-app-fg outline-none placeholder:text-app-muted [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <IconButton
                label="Clear search"
                icon={<LuX />}
                onClick={() => setQuery('')}
                className="h-6 w-6 text-sm"
              />
            )}
          </div>

          {confirmingClear ? (
            <div className="flex items-center gap-2">
              <Button variant="danger" size="sm" onClick={handleClear}>
                Confirm
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmingClear(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmingClear(true)}
              disabled={total === 0}
            >
              <LuTrash2 aria-hidden="true" />
              Clear all
            </Button>
          )}
        </div>

        {entries.length > 0 ? (
          <HistoryList entries={entries} onOpen={open} onRemove={remove} />
        ) : (
          <EmptyState
            icon={<LuHistory />}
            title={total === 0 ? 'No history yet' : 'No matches'}
            description={
              total === 0
                ? 'Pages you open will be saved here with their title, address, date and time.'
                : `Nothing in your history matches "${query}".`
            }
          />
        )}
      </div>
    </motion.div>
  )
}
