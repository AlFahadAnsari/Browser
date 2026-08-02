import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-app-accent text-app-accent-fg hover:opacity-90',
  secondary: 'bg-app-surface-2 text-app-fg hover:bg-app-border',
  danger: 'bg-transparent text-app-danger ring-1 ring-app-danger/40 hover:bg-app-danger/10',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, disabled, children, ...rest }, ref) => (
    <motion.button
      ref={ref}
      type="button"
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  )
)

Button.displayName = 'Button'
