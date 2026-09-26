import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/charm/400.css'
import '@fontsource/charm/700.css'
import '@fontsource/sarabun/400.css'
import '@fontsource/sarabun/600.css'
import './styles/global.css'
import { App } from './App'

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
