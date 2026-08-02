import { motion } from 'framer-motion'
import { LuMapPin } from 'react-icons/lu'
import location from '@/config/location'
import { AddressBar } from '@/components/AddressBar'
import { Logo } from '@/components/Logo'
import { useBrowser } from '@/hooks/useBrowser'
import { useRecentHistory } from '@/hooks/useHistory'
import { RecentVisits } from './components/RecentVisits'

/** Home: the logo, the address bar, and recent history. Nothing else. */
export const HomePage = () => {
  const { open } = useBrowser()
  const recent = useRecentHistory(8)

  return (
    <div className="scroll-thin h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-6 py-14"
      >
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" showWordmark={false} />
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-app-fg">GeoBrowser</h1>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-app-surface px-3 py-1 text-[11px] text-app-muted ring-1 ring-app-border">
              <LuMapPin aria-hidden="true" className="text-app-accent" />
              Browsing from {location.name}, {location.area}, {location.city}, {location.state},{' '}
              {location.country}
            </p>
          </div>
        </div>

        <AddressBar size="lg" autoFocus onSubmit={open} className="w-full" />

        <RecentVisits entries={recent} onOpen={open} />
      </motion.div>
    </div>
  )
}
