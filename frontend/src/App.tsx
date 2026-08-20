import { useEffect, useState } from 'react'

import {
  ApiError,
  getSdgs,
} from './api'

import CampaignForm from './components/CampaignForm'

import type {
  Campaign,
  Sdg,
} from './types'

import './App.css'

export default function App() {
  const [sdgs, setSdgs] =
    useState<Sdg[]>([])

  const [isLoading, setIsLoading] =
    useState<boolean>(true)

  const [loadingError, setLoadingError] =
    useState<string>('')

  const [successMessage, setSuccessMessage] =
    useState<string>('')

  useEffect(() => {
    async function loadSdgs() {
      setIsLoading(true)
      setLoadingError('')

      try {
        const loadedSdgs = await getSdgs()
        setSdgs(loadedSdgs)
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

    void loadSdgs()
  }, [])

  function handleCampaignCreated(
    campaign: Campaign,
  ) {
    setSuccessMessage(
      `"${campaign.title}" was saved successfully.`,
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <p className="eyebrow">
          Digital advocacy toolkit
        </p>

        <h1>
          Digital Advocacy Campaign Studio
        </h1>

        <p className="intro">
          Turn an issue you care about into a
          structured advocacy campaign using four
          guided steps.
        </p>
      </header>

      <main>
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
              Make sure MySQL and the Spring Boot
              backend are running, then refresh
              this page.
            </p>
          </div>
        )}

        {!isLoading && !loadingError && (
          <CampaignForm
            onCampaignCreated={
              handleCampaignCreated
            }
            sdgs={sdgs}
          />
        )}
      </main>
    </div>
  )
}