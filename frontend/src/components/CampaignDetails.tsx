import { useState } from 'react'

import {
  ApiError,
  downloadCampaignPdf,
  downloadCampaignVersionPdf,
} from '../api'

import type {
  Campaign,
  CampaignVersion,
} from '../types'

interface CampaignDetailsProps {
  campaign: Campaign
  version?: CampaignVersion | null
  onBack: () => void
  onBuildAssets: () => void
}

export default function CampaignDetails({
  campaign,
  version = null,
  onBack,
  onBuildAssets,
}: CampaignDetailsProps) {
  const [pdfError, setPdfError] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  async function handlePdfDownload() {
    if (isDownloading) return

    setIsDownloading(true)
    setPdfError('')

    try {
      if (version) {
        await downloadCampaignVersionPdf(version)
      } else {
        await downloadCampaignPdf(campaign.id)
      }
    } catch (error: unknown) {
      setPdfError(
        error instanceof ApiError
          ? error.message
          : 'The PDF could not be downloaded.',
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <section className="campaign-details">
      <button
        className="back-button"
        onClick={onBack}
        type="button"
      >
        ← Back to Campaign History
      </button>

      <div className="campaign-details-header">
        <p className="eyebrow">Advocacy campaign</p>

        <h2>{campaign.title}</h2>

        {version && (
          <p className="draft-note">
            Version {version.versionNumber}
            {' — '}
            {new Date(version.savedAt).toLocaleString()}
          </p>
        )}

        {campaign.sdg && (
          <p className="sdg-label">
            SDG {campaign.sdg.goalNumber}:{' '}
            {campaign.sdg.name}
          </p>
        )}
      </div>

      <div className="campaign-details-grid">
        <article>
          <h3>The problem</h3>
          <p>{campaign.problem}</p>
        </article>

        <article>
          <h3>Desired change</h3>
          <p>{campaign.desiredOutcome}</p>
        </article>

        <article>
          <h3>Core message</h3>
          <p>{campaign.coreMessage}</p>
        </article>

        <article>
          <h3>Who can make the change</h3>
          <p>{campaign.decisionMaker}</p>
        </article>

        <article>
          <h3>Your advocacy plan</h3>
          <p>{campaign.advocacyPlan}</p>
        </article>

        <article>
          <h3>How success will be measured</h3>
          <p>{campaign.successMeasures}</p>
        </article>
      </div>

      {pdfError && (
        <div className="error-summary" role="alert">
          {pdfError}
        </div>
      )}

      <div className="campaign-details-actions">
        <button
          disabled={isDownloading}
          onClick={() => {
            void handlePdfDownload()
          }}
          type="button"
        >
          {isDownloading
            ? 'Preparing PDF...'
            : 'Download PDF'}
        </button>

        <button type="button" onClick={onBuildAssets}>
          Build your campaign assets
        </button>
      </div>
    </section>
  )
}