import { useState } from 'react'
import Markdown from 'react-markdown'

import {
  ApiError,
  downloadCampaignPdf,
  reviewCampaign,
} from '../api'

import type {
  Campaign,
  CampaignPayload,
} from '../types'

interface CampaignDetailsProps {
  campaign: Campaign
  onBack: () => void
}

export default function CampaignDetails({
  campaign,
  onBack,
}: CampaignDetailsProps) {
  const [aiReview, setAiReview] =
    useState<string>('')

  const [aiError, setAiError] =
    useState<string>('')

  const [isReviewing, setIsReviewing] =
    useState<boolean>(false)

  const [isDownloading, setIsDownloading] =
    useState<boolean>(false)

  function createReviewPayload(): CampaignPayload {
    return {
      title: campaign.title,
      problem: campaign.problem,
      sdgId: campaign.sdg?.id ?? null,
      desiredOutcome: campaign.desiredOutcome,
      coreMessage: campaign.coreMessage,
      sharingMethod: campaign.sharingMethod,
      decisionMaker: campaign.decisionMaker,
      firstMoves: campaign.firstMoves,
      successMeasures: campaign.successMeasures,
    }
  }

  async function handleAiReview() {
  setIsReviewing(true)
  setAiError('')
  setAiReview('')

  try {
    const response = await reviewCampaign(
      createReviewPayload(),
    )

    setAiReview(response.review)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      setAiError(error.message)
    } else {
      setAiError(
        'The AI review could not be completed.',
      )
    }
  } finally {
    setIsReviewing(false)
  }
}

  async function handlePdfDownload() {
    setIsDownloading(true)
    setAiError('')

    try {
      await downloadCampaignPdf(campaign.id)
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setAiError(error.message)
      } else {
        setAiError(
          'The PDF could not be downloaded.',
        )
      }
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
        <p className="eyebrow">
          Advocacy campaign
        </p>

        <h2>{campaign.title}</h2>

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
          <h3>How the message will be shared</h3>
          <p>{campaign.sharingMethod}</p>
        </article>

        <article>
          <h3>Who can make the change</h3>
          <p>{campaign.decisionMaker}</p>
        </article>

        <article>
          <h3>First move</h3>
          <p>{campaign.firstMoves}</p>
        </article>

        <article>
          <h3>How success will be measured</h3>
          <p>{campaign.successMeasures}</p>
        </article>
      </div>

      {aiError && (
        <div
          className="error-summary"
          role="alert"
        >
          {aiError}
        </div>
      )}

      {aiReview && (
        <section
          aria-live="polite"
          className="ai-review"
        >
          <p className="eyebrow">
            AI campaign coach
          </p>

          <h3>Your campaign review</h3>

          <div className="ai-review-content">
  <Markdown>{aiReview}</Markdown>
</div>

          <p className="ai-review-note">
            This review is guidance. Your original
            saved campaign has not been changed.
          </p>
        </section>
      )}

      <div className="campaign-details-actions">
        <button
          disabled={
            isDownloading || isReviewing
          }
          onClick={() => {
            void handlePdfDownload()
          }}
          type="button"
        >
          {isDownloading
            ? 'Preparing PDF...'
            : 'Download PDF'}
        </button>

        <button
          disabled={
            isReviewing || isDownloading
          }
          onClick={() => {
            void handleAiReview()
          }}
          type="button"
        >
          {isReviewing
            ? 'Reviewing campaign...'
            : 'Review with AI'}
        </button>
      </div>
    </section>
  )
}