import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
    className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center"
  >
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-app-surface-2 text-xl text-app-muted">
      {icon}
    </span>
    <div className="space-y-1">
      <p className="text-sm font-medium text-app-fg">{title}</p>
      <p className="max-w-sm text-[13px] text-app-muted">{description}</p>
    </div>
    {action}
  </motion.div>
)
