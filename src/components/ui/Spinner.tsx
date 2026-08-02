import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export interface SpinnerProps {
  className?: string
  size?: number
}

/** Indeterminate loading ring. Rendered only while a page load is in flight. */
export const Spinner = ({ className, size = 13 }: SpinnerProps) => (
  <motion.span
    aria-hidden="true"
    style={{ width: size, height: size }}
    className={cn(
      'inline-block shrink-0 rounded-full border-2 border-current border-t-transparent',
      className
    )}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
  />
)
