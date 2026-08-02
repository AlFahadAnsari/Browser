import { useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BrowserState } from '@/types/browser'
import { browserStore } from '@/store/browserStore'
import { browserService } from '@/services/browserService'
import { ROUTES } from '@/app/routes'
import { useStore } from './useStore'

export interface UseBrowserResult {
  state: BrowserState
  /** Loads the input and moves the UI to the website view. */
  open: (input: string) => void
  back: () => void
  forward: () => void
  /** Reloads, or cancels the in-flight load while one is running. */
  reloadOrStop: () => void
}

/** The single entry point components use to drive the website view. */
export const useBrowser = (): UseBrowserResult => {
  const state = useStore(browserStore)
  const navigate = useNavigate()

  const open = useCallback(
    (input: string) => {
      const trimmed = input.trim()
      if (!trimmed) return
      navigate(ROUTES.browse)
      void browserService.navigate(trimmed)
    },
    [navigate]
  )

  const back = useCallback(() => {
    navigate(ROUTES.browse)
    void browserService.back()
  }, [navigate])

  const forward = useCallback(() => {
    navigate(ROUTES.browse)
    void browserService.forward()
  }, [navigate])

  const reloadOrStop = useCallback(() => {
    if (browserStore.getState().isLoading) void browserService.stop()
    else void browserService.reload()
  }, [])

  return useMemo(
    () => ({ state, open, back, forward, reloadOrStop }),
    [state, open, back, forward, reloadOrStop]
  )
}
