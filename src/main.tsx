import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { bootstrap } from '@/services/bootstrap'
import '@/styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root is missing from index.html')

const root = createRoot(container)

// Settings are loaded (and the theme applied) before the first render.
void bootstrap().then(() =>
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
)
