import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AIAssistant from './AIAssistant'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AIAssistant />
  </StrictMode>,
)
