import { motion } from 'framer-motion'
import { LuMoon, LuSun } from 'react-icons/lu'
import type { ThemeMode } from '@/types/settings'
import { cn } from '@/utils/cn'

export interface ThemeToggleProps {
  theme: ThemeMode
  onChange: (theme: ThemeMode) => void
}

const OPTIONS: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
  { value: 'light', label: 'Light', icon: <LuSun /> },
  { value: 'dark', label: 'Dark', icon: <LuMoon /> },
]

/** Segmented Light / Dark control with a sliding indicator. */
export const ThemeToggle = ({ theme, onChange }: ThemeToggleProps) => (
  <div
    role="radiogroup"
    aria-label="Theme"
    className="flex items-center gap-1 rounded-lg bg-app-surface-2 p-1 ring-1 ring-app-border"
  >
    {OPTIONS.map((option) => {
      const isActive = option.value === theme
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium',
            'transition-colors duration-150',
            isActive ? 'text-app-accent-fg' : 'text-app-muted hover:text-app-fg'
          )}
        >
          {isActive && (
            <motion.span
              layoutId="theme-toggle-indicator"
              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              className="absolute inset-0 rounded-md bg-app-accent"
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {option.icon}
            {option.label}
          </span>
        </button>
      )
    })}
  </div>
)
