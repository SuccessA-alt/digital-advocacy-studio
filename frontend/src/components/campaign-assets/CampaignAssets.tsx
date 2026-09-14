import { useEffect, useRef, useState } from 'react'
import type { Campaign } from '../../types'
import PostEditor from './PostEditor'
import EmailEditor from './EmailEditor'
import ImageEditor from './ImageEditor'
import '../CampaignAssets.css'

type AssetType = 'post' | 'image' | 'email'

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
  const [active, setActive] =
    useState<AssetType | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)

  const heading =
    active === 'post'
      ? 'Quick post'
      : active === 'image'
        ? 'Your image, your words'
        : active === 'email'
          ? 'Your campaign email'
          : 'What would you like to create?'

  useEffect(() => {
    headingRef.current?.focus()
    window.scrollTo(0, 0)
  }, [active])

  return (
    <section
      className="campaign-assets"
      aria-labelledby="campaign-assets-heading"
    >
      <button
        type="button"
        className="back-button"
        onClick={() =>
          active ? setActive(null) : onBack()
        }
      >
        {active
          ? '← Back to asset choices'
          : '← Back to campaign'}
      </button>

      <div className="section-heading">
        <p className="eyebrow">
          Build your campaign assets
        </p>

        <h2
          id="campaign-assets-heading"
          ref={headingRef}
          tabIndex={-1}
        >
          {heading}
        </h2>
        <p>For your campaign: {campaign.title}</p>

        {versionNumber !== undefined && (
          <p>Using saved version {versionNumber}.</p>
        )}
      </div>

      {!active && (
        <>
          <div className="asset-options">
            {assetOptions.map((option) => (
              <button
                key={option.id}
                className="asset-option"
                type="button"
                onClick={() => setActive(option.id)}
              >
                <span
                  className="asset-option-icon"
                  aria-hidden="true"
                >
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

          <p className="draft-note">
            Edits stay here while you switch tools.
            Copy or download your work before leaving
            this studio or refreshing the page.
          </p>
        </>
      )}

      <div
        className="asset-tool"
        hidden={active !== 'post'}
      >
        <PostEditor campaign={campaign} />
      </div>

      <div
        className="asset-tool"
        hidden={active !== 'image'}
      >
        <ImageEditor campaign={campaign} />
      </div>

      <div
        className="asset-tool"
        hidden={active !== 'email'}
      >
        <EmailEditor campaign={campaign} />
      </div>
    </section>
  )
}