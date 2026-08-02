import { LuMapPin } from 'react-icons/lu'
import { cn } from '@/utils/cn'

export interface LogoProps {
  className?: string
  /** Renders the wordmark next to the mark. */
  showWordmark?: boolean
  size?: 'sm' | 'lg'
}

export const Logo = ({ className, showWordmark = true, size = 'sm' }: LogoProps) => {
  const isLarge = size === 'lg'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        className={cn(
          'flex items-center justify-center rounded-xl bg-app-accent text-app-accent-fg',
          isLarge ? 'h-12 w-12 text-2xl' : 'h-7 w-7 text-base'
        )}
      >
        <LuMapPin />
      </span>
      {showWordmark && (
        <span
          className={cn(
            'font-semibold tracking-tight text-app-fg',
            isLarge ? 'text-2xl' : 'text-sm'
          )}
        >
          GeoBrowser
        </span>
      )}
    </div>
  )
}
