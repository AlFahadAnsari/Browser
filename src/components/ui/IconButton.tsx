import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Used as both the tooltip and the accessible label. */
  label: string
  icon: ReactNode
  active?: boolean
}

/** Square, icon-only control used across the top bar and lists. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, icon, active = false, className, disabled, ...rest }, ref) => (
    <motion.button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[17px]',
        'text-app-muted transition-colors duration-150',
        'hover:bg-app-surface-2 hover:text-app-fg',
        'disabled:pointer-events-none disabled:opacity-35',
        active && 'bg-app-surface-2 text-app-fg',
        className
      )}
      {...rest}
    >
      {icon}
    </motion.button>
  )
)

IconButton.displayName = 'IconButton'
