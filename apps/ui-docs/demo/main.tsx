import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import posthog from 'posthog-js'
import { App } from './App'
import './demo.css'
import { initializeSiteAnalytics } from '@n3wth/site-config/analytics'

initializeSiteAnalytics(posthog, {
  api_host: 'https://elephant.n3wth.com',
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
  capture_pageview: true,
  capture_pageleave: true,
  capture_performance: { web_vitals: true },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)
