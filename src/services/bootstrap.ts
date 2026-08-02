import { browserService } from './browserService'
import { historyService } from './historyService'
import { settingsService } from './settingsService'

/**
 * Prepares the renderer before the first paint.
 *
 * The persisted theme is applied *before* React mounts so the window never flashes the
 * wrong colour scheme, and the IPC subscriptions are opened once for the lifetime of the
 * application.
 */
export const bootstrap = async (): Promise<void> => {
  await settingsService.load()
  browserService.init()
  historyService.init()
}
