import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectProvider } from './providers/ProjectProvider'
import { BrandProvider } from './providers/BrandProvider'
import { ContentProvider } from './providers/ContentProvider'
import { WorkflowProvider } from './providers/WorkflowProvider'
import { CalendarProvider } from './providers/CalendarProvider'
import { AutomationProvider } from './providers/AutomationProvider'
import { AgentProvider } from './providers/AgentProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectProvider>
      <BrandProvider>
        <ContentProvider>
          <WorkflowProvider>
            <CalendarProvider>
              <AutomationProvider>
                <AgentProvider>
                  <App />
                </AgentProvider>
              </AutomationProvider>
            </CalendarProvider>
          </WorkflowProvider>
        </ContentProvider>
      </BrandProvider>
    </ProjectProvider>
  </StrictMode>,
)
