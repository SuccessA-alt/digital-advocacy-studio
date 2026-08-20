import type { Campaign } from '../types'

interface CampaignHistoryProps {
  campaigns: Campaign[]
  onCampaignSelected: (
    campaign: Campaign,
  ) => void
}

export default function CampaignHistory({
  campaigns,
  onCampaignSelected,
}: CampaignHistoryProps) {
  return (
    <section className="campaign-history">
      <div className="section-heading">
        <p className="eyebrow">
          Your previous work
        </p>

        <h2>Campaign History</h2>

        <p>
          Select a campaign to review its complete
          plan.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <h3>No campaigns yet</h3>

          <p>
            Create your first campaign using the
            campaign builder.
          </p>
        </div>
      ) : (
        <div className="history-list">
          {campaigns.map((campaign) => (
            <button
              className="history-card"
              key={campaign.id}
              onClick={() =>
                onCampaignSelected(campaign)
              }
              type="button"
            >
              <div>
                <h3>{campaign.title}</h3>

                <p>{campaign.problem}</p>
              </div>

              <div className="history-card-footer">
                {campaign.sdg ? (
                  <span>
                    SDG {campaign.sdg.goalNumber}
                  </span>
                ) : (
                  <span>No SDG selected</span>
                )}

                <span>View campaign →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}