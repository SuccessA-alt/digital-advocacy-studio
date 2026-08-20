import { useEffect, useState } from 'react'

import {
  ApiError,
  getCampaigns,
  getSdgs,
} from './api'

import CampaignDetails from './components/CampaignDetails'
import CampaignForm from './components/CampaignForm'
import CampaignHistory from './components/CampaignHistory'

import type {
  Campaign,
  Sdg,
} from './types'

import './App.css'

type AppView =
  | 'builder'
  | 'history'
  | 'details'

export default function App() {
  const [view, setView] =
    useState<AppView>('builder')

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
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <p className="eyebrow">
            Digital advocacy toolkit
          </p>

          <h1>
            Digital Advocacy Campaign Studio
          </h1>

          <p className="intro">
            Turn an issue you care about into a
            structured advocacy campaign.
          </p>
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
              Make sure MySQL and Spring Boot are
              running, then refresh the page.
            </p>
          </div>
        )}

        {!isLoading &&
          !loadingError &&
          view === 'builder' && (
            <CampaignForm
              onCampaignCreated={
                handleCampaignCreated
              }
              sdgs={sdgs}
            />
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
  )
}