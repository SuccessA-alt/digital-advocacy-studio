import { useEffect, useState } from 'react'

import { ApiError, getCampaignVersions } from '../api'
import type { Campaign, CampaignVersion, Sdg } from '../types'
import CampaignDetails from './CampaignDetails'
import CampaignForm from './CampaignForm'
import CampaignAssets from './campaign-assets/CampaignAssets'

interface CampaignWorkspaceProps {
  campaign: Campaign
  sdgs: Sdg[]
  onBack: () => void
  onSaveDraft: () => void
  saveDisabled: boolean
  onCampaignSaved: (campaign: Campaign) => void
}

export default function CampaignWorkspace({
  campaign,
  sdgs,
  onBack,
  onSaveDraft,
  saveDisabled,
  onCampaignSaved,
}: CampaignWorkspaceProps) {
  const [versions, setVersions] = useState<CampaignVersion[]>([])
  const [selectedVersion, setSelectedVersion] =
    useState<CampaignVersion | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isBuildingAssets, setIsBuildingAssets] = useState(false)
  const [hasOpenedAssets, setHasOpenedAssets] = useState(false)
  const [isLoadingVersions, setIsLoadingVersions] = useState(true)
  const [versionError, setVersionError] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)
  const isDraft = campaign.id === null

  useEffect(() => {
    const campaignId = campaign.id
    if (campaignId === null) return

    let cancelled = false

    async function loadVersions(campaignId: number) {
      try {
        const savedVersions = await getCampaignVersions(campaignId)
        if (!cancelled) setVersions(savedVersions)
      } catch (error: unknown) {
        if (!cancelled) {
          setVersionError(
            error instanceof ApiError
              ? error.message
              : 'Version history could not be loaded.',
          )
        }
      } finally {
        if (!cancelled) setIsLoadingVersions(false)
      }
    }

    void loadVersions(campaignId)

    return () => {
      cancelled = true
    }
  }, [campaign.id, refreshCount])

  function reloadVersions() {
    setVersionError('')
    setIsLoadingVersions(true)
    setRefreshCount((count) => count + 1)
  }

  function handleSaved(updatedCampaign: Campaign) {
    onCampaignSaved(updatedCampaign)
    setSelectedVersion(null)
    setIsEditing(false)

    if (updatedCampaign.id !== null) {
      reloadVersions()
    }
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

  return (
    <>
      {hasOpenedAssets && (
        <div hidden={!isBuildingAssets}>
          <CampaignAssets
            key={selectedVersion?.id ?? 'current'}
            campaign={displayedCampaign}
            versionNumber={selectedVersion?.versionNumber}
            onBack={() => setIsBuildingAssets(false)}
          />
        </div>
      )}

      <div hidden={isBuildingAssets}>
        {isEditing ? (
          <>
            <div className="section-heading">
              <h2>
                {selectedVersion
                  ? 'Editing from version ' + selectedVersion.versionNumber
                  : 'Edit campaign'}
              </h2>

              <p>
                {isDraft
                  ? 'Make your edits using the campaign steps. Apply changes updates your draft without saving it.'
                  : 'Make your edits using the campaign steps. Save changes creates a new version and keeps all earlier versions.'}
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
        ) : (
          <>
            <section
              className="campaign-version-panel"
              aria-labelledby="version-history-heading"
            >
              <h2 id="version-history-heading">
                {isDraft ? 'Unsaved draft' : 'Version history'}
              </h2>

              {isDraft ? (
                <p className="draft-note">
                  This campaign has not been saved. Download your work before
                  refreshing, closing this tab or opening another campaign.
                </p>
              ) : (
                <>
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
                </>
              )}

              <div className="campaign-details-actions">
                {isDraft ? (
                  <button
                    type="button"
                    disabled={saveDisabled}
                    onClick={onSaveDraft}
                  >
                    Save campaign
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsEditing(true)}>
                    {selectedVersion ? 'Use this version' : 'Edit campaign'}
                  </button>
                )}
              </div>
            </section>

            <CampaignDetails
              key={selectedVersion?.id ?? 'current'}
              campaign={displayedCampaign}
              version={selectedVersion}
              onBack={onBack}
              onEdit={() => setIsEditing(true)}
              onBuildAssets={() => {
                setHasOpenedAssets(true)
                setIsBuildingAssets(true)
                window.scrollTo(0, 0)
              }}
            />
          </>
        )}
      </div>
    </>
  )
}