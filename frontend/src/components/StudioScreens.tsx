//This renders the existing screens and keeps the current workspace mounted.

import CampaignForm from './CampaignForm'
import CampaignHistory from './CampaignHistory'
import CampaignWorkspace from './CampaignWorkspace'
import WelcomePage from './WelcomePage'
import type { Studio } from '../hooks/useStudio'

interface StudioScreensProps {
  studio: Studio
}

export default function StudioScreens({ studio }: StudioScreensProps) {
  const { view, selectedCampaign, sdgData, accountData } = studio
  const { account, campaigns, checking, loadingHistory, historyError } = accountData

  return (
    <>
      {view === 'welcome' && (
        <WelcomePage onStart={() => studio.navigate('builder')} />
      )}

      <div className="studio-screen" hidden={view === 'welcome'}>
        {sdgData.loading && (
          <p className="status-message">Loading the campaign studio…</p>
        )}

        {sdgData.error && (
          <div className="error-summary" role="alert">
            {sdgData.error}
          </div>
        )}

        {!sdgData.loading && !sdgData.error && (
          <>
            <div className="studio-screen" hidden={view !== 'builder'}>
              <CampaignForm
                isActive={view === 'builder'}
                sdgs={sdgData.sdgs}
                onCampaignSaved={studio.handleCampaignCreated}
                onBackToWelcome={() => studio.navigate('welcome')}
              />
            </div>

            {view === 'history' && (
              account?.authenticated ? (
                <>
                  <button
                    type="button"
                    className="back-button"
                    disabled={loadingHistory}
                    onClick={() => {
                      void accountData.loadHistory(account)
                    }}
                  >
                    Refresh history
                  </button>

                  {loadingHistory ? (
                    <p role="status">Loading your campaigns…</p>
                  ) : historyError ? (
                    <p role="alert">{historyError}</p>
                  ) : (
                    <CampaignHistory
                      campaigns={campaigns}
                      onCampaignSelected={studio.openCampaign}
                    />
                  )}
                </>
              ) : (
                <section className="campaign-version-panel">
                  <h2>My campaign history</h2>
                  <p>Sign in to see campaigns saved to your account.</p>

                  <div className="campaign-details-actions">
                    <button
                      type="button"
                      onClick={() => studio.beginSignIn({ kind: 'history' })}
                    >
                      Create an account / Sign in
                    </button>
                  </div>
                </section>
              )
            )}

            {selectedCampaign && (
              <div className="studio-screen" hidden={view !== 'details'}>
                <CampaignWorkspace
                  key={selectedCampaign.draftKey ?? selectedCampaign.id}
                  campaign={selectedCampaign}
                  sdgs={sdgData.sdgs}
                  onCampaignSaved={studio.handleCampaignUpdated}
                  onSaveDraft={studio.saveCurrentCampaign}
                  saveDisabled={checking || account === null}
                  onBack={() => studio.navigate('history')}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}