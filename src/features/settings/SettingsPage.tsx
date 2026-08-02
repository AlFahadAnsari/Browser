import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuCheck, LuTrash2 } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { useHistory } from '@/hooks/useHistory'
import { useTheme } from '@/hooks/useTheme'
import { SettingRow } from './components/SettingRow'
import { ThemeToggle } from './components/ThemeToggle'

/** Settings: clear history, and light/dark mode. Nothing else. */
export const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const { total, clear } = useHistory()
  const [confirming, setConfirming] = useState(false)
  const [cleared, setCleared] = useState(false)

  const handleClear = (): void => {
    clear()
    setConfirming(false)
    setCleared(true)
    window.setTimeout(() => setCleared(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="scroll-thin h-full overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-2xl space-y-3 px-6 py-8">
        <h1 className="mb-5 text-lg font-semibold tracking-tight text-app-fg">Settings</h1>

        <SettingRow
          title="Appearance"
          description="Switch between light and dark mode."
          control={<ThemeToggle theme={theme} onChange={setTheme} />}
        />

        <SettingRow
          title="Browsing history"
          description={
            total === 0
              ? 'No entries stored.'
              : `${total} ${total === 1 ? 'entry' : 'entries'} stored on this device.`
          }
          control={
            cleared ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] text-app-accent">
                <LuCheck aria-hidden="true" />
                Cleared
              </span>
            ) : confirming ? (
              <div className="flex items-center gap-2">
                <Button variant="danger" size="sm" onClick={handleClear}>
                  Confirm
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirming(true)}
                disabled={total === 0}
              >
                <LuTrash2 aria-hidden="true" />
                Clear history
              </Button>
            )
          }
        />
      </div>
    </motion.div>
  )
}
