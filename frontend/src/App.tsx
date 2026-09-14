import { useEffect, useRef, useState } from 'react'

import { ApiError, getCampaigns, getSdgs } from './api'
import AppHeader from './components/AppHeader'
import type { AppView } from './components/AppHeader'
import CampaignWorkspace from './components/CampaignWorkspace'
import CampaignForm from './components/CampaignForm'
import CampaignHistory from './components/CampaignHistory'
import WelcomePage from './components/WelcomePage'
import ThemeSelect from './components/ThemeSelect'
import { useTheme } from './hooks/useTheme'
import type { Campaign, Sdg } from './types'

import './App.css'

export default function App() {
  const { theme, setTheme } = useTheme()
  const [view, setView] = useState<AppView>('welcome')
  const [sdgs, setSdgs] = useState<Sdg[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const mainRef = useRef<HTMLElement>(null)
  const previousView = useRef(view)

  useEffect(() => {
    let cancelled = false

    async function loadApplicationData() {
      try {
        const [loadedSdgs, loadedCampaigns] = await Promise.all([
          getSdgs(),
          getCampaigns(),
        ])

        if (!cancelled) {
          setSdgs(loadedSdgs)
          setCampaigns(loadedCampaigns)
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setLoadingError(
            error instanceof ApiError
              ? error.message
              : 'The application could not connect to the backend.',
          )
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void loadApplicationData()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [view])

  function navigate(nextView: AppView) {
    setView(nextView)
    setSuccessMessage('')
    // Keep the selected campaign so Current Campaign can resume its editor.
  }

  function showBuilder() {
    navigate('builder')
  }

  function showHistory() {
    navigate('history')
  }

  function handleCampaignCreated(campaign: Campaign) {
    setCampaigns((current) => [campaign, ...current])
    setSelectedCampaign(campaign)
    setView('details')
    setSuccessMessage(`"${campaign.title}" was saved successfully.`)
  }

  function handleCampaignUpdated(campaign: Campaign) {
    setCampaigns((current) =>
      current.map((saved) => saved.id === campaign.id ? campaign : saved),
    )
    setSelectedCampaign(campaign)
    setView('details')
    setSuccessMessage('Your changes were saved as a new version.')
  }

  function handleCampaignSelected(campaign: Campaign) {
    setSelectedCampaign(campaign)
    navigate('details')
  }

  return (
    <div className="app">
      {/* This header remains visible on every screen, including Home. */}
      <AppHeader
        view={view}
        hasCurrentCampaign={selectedCampaign !== null}
        onNavigate={navigate}
      />
      <ThemeSelect theme={theme} onThemeChange={setTheme} />

      <main
        id="studio-main"
        ref={mainRef}
        tabIndex={-1}
        className={view === 'welcome' ? 'studio-home-content' : 'main-content'}
      >
        {view === 'welcome' && <WelcomePage onStart={showBuilder} />}

        <div className="studio-screen" hidden={view === 'welcome'}>
          {successMessage && (
            <div className="success-message" role="status">
              {successMessage}
            </div>
          )}

          {isLoading && (
            <p className="status-message">Loading the campaign studio...</p>
          )}

          {loadingError && (
            <div className="error-summary" role="alert">
              <h2>Unable to load the application</h2>
              <p>{loadingError}</p>
              <p>
                Please try refreshing the page. Your campaign studio is temporarily unavailable.
              </p>
            </div>
          )}

          {!isLoading && !loadingError && (
            <>
              <div className="studio-screen" hidden={view !== 'builder'}>
                <CampaignForm
                  isActive={view === 'builder'}
                  sdgs={sdgs}
                  onCampaignSaved={handleCampaignCreated}
                  onBackToWelcome={() => navigate('welcome')}
                />
              </div>

              {view === 'history' && (
                <CampaignHistory
                  campaigns={campaigns}
                  onCampaignSelected={handleCampaignSelected}
                />
              )}

              {/* Hiding instead of unmounting preserves this workspace's edits. */}
              {selectedCampaign && (
                <div className="studio-screen" hidden={view !== 'details'}>
                  <CampaignWorkspace
                    key={selectedCampaign.id}
                    campaign={selectedCampaign}
                    sdgs={sdgs}
                    onCampaignSaved={handleCampaignUpdated}
                    onBack={showHistory}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
