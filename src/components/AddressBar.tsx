import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { LuCornerDownLeft, LuSearch } from 'react-icons/lu'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import { resolveAddress } from '@/utils/url'

export interface AddressBarProps {
  /** URL currently loaded in the website view; mirrored while the field is idle. */
  currentUrl?: string
  onSubmit: (input: string) => void
  size?: 'md' | 'lg'
  autoFocus?: boolean
  placeholder?: string
  /** Renders the explicit "Go" button next to the field. */
  showGoButton?: boolean
  className?: string
}

/**
 * The single input of the application.
 *
 * It accepts `google.com`, `https://google.com`, `amazon.in/deals`, `localhost:3000`, or a
 * plain phrase such as `weather`, which is sent to Google search. The resolution logic is
 * shared with the main process, so the inline hint always matches what will happen.
 */
export const AddressBar = ({
  currentUrl = '',
  onSubmit,
  size = 'md',
  autoFocus = false,
  placeholder = 'Search Google or type a website address',
  showGoButton = true,
  className,
}: AddressBarProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(currentUrl)
  const [isEditing, setIsEditing] = useState(false)
  const [syncedUrl, setSyncedUrl] = useState(currentUrl)

  // While the user is not editing, the field mirrors the page that is actually loaded.
  // Adjusting during render (rather than in an effect) avoids a second render pass.
  if (!isEditing && currentUrl !== syncedUrl) {
    setSyncedUrl(currentUrl)
    setValue(currentUrl)
  }

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const resolved = resolveAddress(value)
  const isLarge = size === 'lg'

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const input = value.trim()
    if (!input) return
    inputRef.current?.blur()
    setIsEditing(false)
    onSubmit(input)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Escape') return
    setIsEditing(false)
    setValue(currentUrl)
    setSyncedUrl(currentUrl)
    inputRef.current?.blur()
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn('flex min-w-0 flex-1 items-center gap-2', className)}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-app-surface-2',
          'ring-1 ring-app-border transition-shadow duration-150',
          'focus-within:ring-2 focus-within:ring-app-accent/70',
          isLarge ? 'h-12 px-4' : 'h-9 px-3'
        )}
      >
        <LuSearch
          aria-hidden="true"
          className={cn('shrink-0 text-app-muted', isLarge ? 'text-lg' : 'text-[15px]')}
        />

        <label htmlFor={inputId} className="sr-only">
          Website address or search
        </label>

        <input
          id={inputId}
          ref={inputRef}
          value={value}
          onChange={(event) => {
            setIsEditing(true)
            setValue(event.target.value)
          }}
          onFocus={(event) => {
            setIsEditing(true)
            event.target.select()
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={handleKeyDown}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-app-fg outline-none placeholder:text-app-muted',
            isLarge ? 'text-[15px]' : 'text-[13px]'
          )}
        />

        {isEditing && resolved && (
          <span className="hidden shrink-0 items-center gap-1.5 text-[11px] text-app-muted md:flex">
            {resolved.kind === 'search' ? 'Search Google' : 'Open site'}
            <LuCornerDownLeft aria-hidden="true" />
          </span>
        )}
      </div>

      {showGoButton && (
        <Button
          type="submit"
          variant="primary"
          size={isLarge ? 'md' : 'sm'}
          className={cn(isLarge && 'h-12 px-6')}
          disabled={value.trim().length === 0}
        >
          Go
        </Button>
      )}
    </form>
  )
}
