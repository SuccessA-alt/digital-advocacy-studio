import { useEffect, useState } from 'react'

import { ApiError, getCampaignVersions } from '../api'
import type { Campaign, CampaignVersion, Sdg } from '../types'
import CampaignDetails from './CampaignDetails'
import CampaignForm from './CampaignForm'
import CampaignAssets from './CampaignAssets'

interface CampaignWorkspaceProps {
  campaign: Campaign
  sdgs: Sdg[]
  onBack: () => void
  onCampaignSaved: (campaign: Campaign) => void
}

export default function CampaignWorkspace({
  campaign,
  sdgs,
  onBack,
  onCampaignSaved,
}: CampaignWorkspaceProps) {
  const [versions, setVersions] = useState<CampaignVersion[]>([])
  const [selectedVersion, setSelectedVersion] =
    useState<CampaignVersion | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isBuildingAssets, setIsBuildingAssets] = useState(false)
  const [isLoadingVersions, setIsLoadingVersions] = useState(true)
  const [versionError, setVersionError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadVersions() {
      try {
        const savedVersions = await getCampaignVersions(campaign.id)

        if (!cancelled) {
          setVersions(savedVersions)
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setVersionError(
            error instanceof ApiError
              ? error.message
              : 'Version history could not be loaded.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVersions(false)
        }
      }
    }

    void loadVersions()

    return () => {
      cancelled = true
    }
  }, [campaign.id, refreshCount])

  function reloadVersions() {
    setVersionError('')
    setIsLoadingVersions(true)
    setRefreshCount((count) => count + 1)
  }

  function handleSaved(savedCampaign: Campaign) {
    onCampaignSaved(savedCampaign)
    setSelectedVersion(null)
    setIsEditing(false)
    reloadVersions()
  }

  const displayedCampaign: Campaign = selectedVersion
    ? {
        ...campaign,
        title: selectedVersion.title,
        problem: selectedVersion.problem,
        sdg:
          selectedVersion.sdgId !== null &&
          selectedVersion.sdgGoalNumber !== null &&
          selectedVersion.sdgName !== null
            ? {
                id: selectedVersion.sdgId,
                goalNumber: selectedVersion.sdgGoalNumber,
                name: selectedVersion.sdgName,
              }
            : null,
        desiredOutcome: selectedVersion.desiredOutcome,
        coreMessage: selectedVersion.coreMessage,
        sharingMethod: selectedVersion.sharingMethod,
        decisionMaker: selectedVersion.decisionMaker,
        advocacyPlan: selectedVersion.advocacyPlan,
        successMeasures: selectedVersion.successMeasures,
        updatedAt: selectedVersion.savedAt,
      }
    : campaign

  if (isBuildingAssets) {
    return (
      <CampaignAssets
        campaign={displayedCampaign}
        versionNumber={selectedVersion?.versionNumber}
        onBack={() => setIsBuildingAssets(false)}
      />
    )
  }

  if (isEditing) {
    return (
      <>
        <div className="section-heading">
          <h2>
            {selectedVersion
              ? 'Editing from version ' + selectedVersion.versionNumber
              : 'Edit campaign'}
          </h2>
          <p>
            Make your edits using the campaign steps.
            Save changes creates a new version and keeps all earlier versions.
          </p>
        </div>

        <CampaignForm
          key={selectedVersion?.id ?? 'current'}
          sdgs={sdgs}
          initialCampaign={displayedCampaign}
          onBackToWelcome={() => setIsEditing(false)}
          onCampaignSaved={handleSaved}
        />
      </>
    )
  }

  return (
    <>
      <section
        className="campaign-version-panel"
        aria-labelledby="version-history-heading"
      >
        <h2 id="version-history-heading">Version history</h2>
        <p>
          Choose a saved version to read, download or continue working from.
        </p>

        {isLoadingVersions ? (
          <p role="status">Loading saved versions...</p>
        ) : versionError ? (
          <div className="error-summary" role="alert">
            <p>{versionError}</p>
            <button type="button" onClick={reloadVersions}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="campaign-version">View a version</label>
            <select
              id="campaign-version"
              value={selectedVersion?.id ?? ''}
              onChange={(event) => {
                const versionId = Number(event.target.value)

                setSelectedVersion(
                  versions.find((version) => version.id === versionId) ?? null,
                )
              }}
            >
              <option value="">Current campaign</option>
              {versions.map((version) => (
                <option key={version.id} value={version.id}>
                  Version {version.versionNumber}
                  {' — '}
                  {new Date(version.savedAt).toLocaleString()}
                </option>
              ))}
            </select>

            {versions.length === 0 && (
              <p>
                This campaign was saved before version history was added.
                Your next save will keep both the existing campaign
                and your edited version.
              </p>
            )}
          </>
        )}

        <div className="campaign-details-actions">
          <button type="button" onClick={() => setIsEditing(true)}>
            {selectedVersion ? 'Use this version' : 'Edit campaign'}
          </button>
        </div>
      </section>

      <CampaignDetails
        key={selectedVersion?.id ?? 'current'}
        campaign={displayedCampaign}
        version={selectedVersion}
        onBack={onBack}
        onBuildAssets={() => {
          setIsBuildingAssets(true)
          window.scrollTo(0, 0)
        }}
      />
    </>
  )
}