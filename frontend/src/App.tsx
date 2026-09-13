import { useEffect, useState } from 'react'

import {
  ApiError,
  getCampaigns,
  getSdgs,
} from './api'

import CampaignDetails from './components/CampaignDetails'
import CampaignForm from './components/CampaignForm'
import CampaignHistory from './components/CampaignHistory'
import WelcomePage from './components/WelcomePage'

import type {
  Campaign,
  Sdg,
} from './types'

import ThemeSelect from './components/ThemeSelect'
import { useTheme } from './hooks/useTheme'

import './App.css'

type AppView =
  | 'welcome'
  | 'builder'
  | 'history'
  | 'details'
  | 'edit'

export default function App() {
  const { theme, setTheme } = useTheme()
  const [view, setView] =
  useState<AppView>('welcome')

  const [sdgs, setSdgs] =
    useState<Sdg[]>([])

  const [campaigns, setCampaigns] =
    useState<Campaign[]>([])

  const [selectedCampaign, setSelectedCampaign] =
    useState<Campaign | null>(null)

  const [isLoading, setIsLoading] =
    useState<boolean>(true)

  const [loadingError, setLoadingError] =
    useState<string>('')

  const [successMessage, setSuccessMessage] =
    useState<string>('')

  useEffect(() => {
    async function loadApplicationData() {
      setIsLoading(true)
      setLoadingError('')

      try {
        const [
          loadedSdgs,
          loadedCampaigns,
        ] = await Promise.all([
          getSdgs(),
          getCampaigns(),
        ])

        setSdgs(loadedSdgs)
        setCampaigns(loadedCampaigns)
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          setLoadingError(error.message)
        } else {
          setLoadingError(
            'The application could not connect to the backend.',
          )
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadApplicationData()
  }, [])

  function showBuilder() {
    setView('builder')
    setSelectedCampaign(null)
    setSuccessMessage('')
  }

  function showHistory() {
    setView('history')
    setSelectedCampaign(null)
    setSuccessMessage('')
  }

  function handleCampaignCreated(
  campaign: Campaign,
) {
  setCampaigns((currentCampaigns) => [
    campaign,
    ...currentCampaigns,
  ])

  setSelectedCampaign(campaign)
  setView('details')

  setSuccessMessage(
    `"${campaign.title}" was saved successfully.`,
  )
}
  function handleCampaignSelected(
    campaign: Campaign,
  ) {
    setSelectedCampaign(campaign)
    setView('details')
  }
  return (
    <>
      {view === 'welcome' && (
        <WelcomePage theme={theme} onThemeChange={setTheme}
          onStart={showBuilder} onViewCampaigns={showHistory} />
      )}
      <div className="app" hidden={view === 'welcome'}>
      <header className="app-header">
        <div className="header-content">

          <h1>
            Digital Advocacy Campaign Studio
          </h1>
          <ThemeSelect theme={theme} onThemeChange={setTheme} />
        </div>

        <nav
          aria-label="Main navigation"
          className="main-navigation"
        >
          <button
            className={
              view === 'builder'
                ? 'navigation-button active'
                : 'navigation-button'
            }
            onClick={showBuilder}
            type="button"
          >
            Build Campaign
          </button>

          <button
            className={
              view === 'history' ||
              view === 'details'
                ? 'navigation-button active'
                : 'navigation-button'
            }
            onClick={showHistory}
            type="button"
          >
            Campaign History
          </button>
        </nav>
      </header>

      <main className="main-content">
        {successMessage && (
          <div
            className="success-message"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {isLoading && (
          <p className="status-message">
            Loading the campaign studio...
          </p>
        )}

        {loadingError && (
          <div
            className="error-summary"
            role="alert"
          >
            <h2>Unable to load the application</h2>
            <p>{loadingError}</p>

            <p>
              Please try refreshing the page. Your campaign studio is temporarily unavailable.
            </p>
          </div>
        )}

        {!isLoading && !loadingError && (
          <div className="builder-view" hidden={view !== 'builder'}>
           <CampaignForm
  sdgs={sdgs}
  onCampaignSaved={handleCampaignCreated}
  onBackToWelcome={() => setView('welcome')}
/>
          </div>
        )}

        {!isLoading &&
          !loadingError &&
          view === 'history' && (
            <CampaignHistory
              campaigns={campaigns}
              onCampaignSelected={
                handleCampaignSelected
              }
            />
          )}

        {!isLoading &&
          !loadingError &&
          view === 'details' &&
          selectedCampaign && (
            <CampaignDetails
              campaign={selectedCampaign}
              onBack={showHistory}
            />
          )}
      </main>
      </div>
    </>
  )
}
