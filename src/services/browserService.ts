import type { BrowserState, ViewBounds } from '@/types/browser'
import { browserStore } from '@/store/browserStore'
import { bridge } from './bridge'

const apply = (state: BrowserState): BrowserState => {
  browserStore.setState(state)
  return state
}

export const browserService = {
  /** Streams navigation state from the main process into the store. */
  init(): () => void {
    void bridge().browser.getState().then(apply)
    return bridge().browser.onStateChanged(apply)
  },

  async navigate(input: string): Promise<void> {
    apply(await bridge().browser.navigate(input))
  },

  async back(): Promise<void> {
    apply(await bridge().browser.back())
  },

  async forward(): Promise<void> {
    apply(await bridge().browser.forward())
  },

  async reload(): Promise<void> {
    apply(await bridge().browser.reload())
  },

  async stop(): Promise<void> {
    apply(await bridge().browser.stop())
  },

  setBounds(bounds: ViewBounds): void {
    void bridge().browser.setBounds(bounds)
  },

  setVisible(visible: boolean): void {
    void bridge().browser.setVisible(visible)
  },
}
