import type { ReactNode } from 'react'

export interface SettingRowProps {
  title: string
  description: string
  control: ReactNode
}

export const SettingRow = ({ title, description, control }: SettingRowProps) => (
  <div className="flex flex-wrap items-center gap-4 rounded-xl bg-app-surface px-4 py-3.5 ring-1 ring-app-border">
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-medium text-app-fg">{title}</p>
      <p className="text-[12px] text-app-muted">{description}</p>
    </div>
    <div className="shrink-0">{control}</div>
  </div>
)
