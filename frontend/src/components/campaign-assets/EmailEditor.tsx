import { useState } from 'react'
import type { Campaign } from '../../types'
import CopyButton from './CopyButton'
import { makeEmail } from './assetDrafts'
import { downloadFile } from './assetFiles'

export default function EmailEditor({
  campaign,
}: {
  campaign: Campaign
}) {
  const [subject, setSubject] = useState(campaign.title)

  const [body, setBody] = useState(() =>
    makeEmail(campaign, 0),
  )

  const [variant, setVariant] = useState(0)

  const email = 'Subject: ' + subject + '\n\n' + body

  function anotherWay() {
    const next = (variant + 1) % 3
    setVariant(next)
    setBody(makeEmail(campaign, next))
  }

  return (
    <div className="asset-editor">
      <label htmlFor="asset-email-subject">
        Subject
      </label>

      <input
        id="asset-email-subject"
        value={subject}
        onChange={(event) =>
          setSubject(event.target.value)
        }
      />

      <label htmlFor="asset-email-body">
        Email message
      </label>

      <textarea
        id="asset-email-body"
        rows={17}
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />

      <div className="asset-toolbar">
        <CopyButton text={email} label="Copy email" />

        <button
          type="button"
          className="asset-secondary"
          onClick={anotherWay}
        >
          ↻ Another way
        </button>

        <button
          type="button"
          className="asset-secondary"
          onClick={() =>
            downloadFile(
              new Blob([email], {
                type: 'text/plain;charset=utf-8',
              }),
              'campaign-' + campaign.id + '-email.txt',
            )
          }
        >
          Download email
        </button>
      </div>

      <p className="draft-note">
        Replace the name placeholder, then paste your
        draft into your email app.
      </p>
    </div>
  )
}