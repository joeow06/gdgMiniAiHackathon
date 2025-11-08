import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AIAssistant from './components/AIAssistant'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AIAssistant />
  </StrictMode>,
)
