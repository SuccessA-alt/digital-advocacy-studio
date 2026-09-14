import { useEffect, useRef, useState } from 'react'
import type { Campaign } from '../types'
import './CampaignAssets.css'

interface CampaignAssetsProps {
  campaign: Campaign
  versionNumber?: number
  onBack: () => void
}

const assetOptions = [
  {
    id: 'post',
    icon: '✍️',
    title: 'A post',
    description:
      'Create text for X, LinkedIn or Instagram. Edit, copy and share.',
  },
  {
    id: 'image',
    icon: '🖼️',
    title: 'An image',
    description:
      'Your photo or a template, with your words, sized for the platform.',
  },
  {
    id: 'email',
    icon: '✉️',
    title: 'An email',
    description:
      'Draft an email to the person who can help make the change.',
  },
] as const

export default function CampaignAssets({
  campaign,
  versionNumber,
  onBack,
}: CampaignAssetsProps) {
  const [selectedAsset, setSelectedAsset] = useState<
    'post' | 'image' | 'email' | null
  >(null)

  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const selectedOption = assetOptions.find(
    (option) => option.id === selectedAsset,
  )

  return (
    <section
      className="campaign-assets"
      aria-labelledby="campaign-assets-heading"
    >
      <button
        className="back-button"
        type="button"
        onClick={onBack}
      >
        ← Back to campaign
      </button>

      <div className="section-heading">
        <p className="eyebrow">Build your campaign assets</p>

        <h2
          id="campaign-assets-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          What would you like to create?
        </h2>

        <p>For your campaign: {campaign.title}</p>

        {versionNumber !== undefined && (
          <p>Using saved version {versionNumber}.</p>
        )}
      </div>

      <div className="asset-options">
        {assetOptions.map((option) => (
          <button
            key={option.id}
            className="asset-option"
            type="button"
            aria-pressed={selectedAsset === option.id}
            onClick={() => setSelectedAsset(option.id)}
          >
            <span className="asset-option-icon" aria-hidden="true">
              {option.icon}
            </span>

            <span className="asset-option-title">
              {option.title}
            </span>

            <span className="asset-option-description">
              {option.description}
            </span>
          </button>
        ))}
      </div>

      <p className="draft-note" role="status">
        {selectedOption ? `Selected: ${selectedOption.title}` : ''}
      </p>
    </section>
  )
}