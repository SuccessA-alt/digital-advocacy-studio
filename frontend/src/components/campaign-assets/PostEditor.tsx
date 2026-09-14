import { useState } from 'react'
import type { Campaign } from '../../types'
import CopyButton from './CopyButton'
import { makePost } from './assetDrafts'
import type { Platform } from './assetDrafts'

export default function PostEditor({
  campaign,
}: {
  campaign: Campaign
}) {
  const [platform, setPlatform] =
    useState<Platform>('x')

  const [variants, setVariants] = useState({
    x: 0,
    linkedin: 0,
    instagram: 0,
  })

  const [posts, setPosts] = useState(() => ({
    x: makePost(campaign, 'x', 0),
    linkedin: makePost(campaign, 'linkedin', 0),
    instagram: makePost(campaign, 'instagram', 0),
  }))

  function anotherWay() {
    const next = (variants[platform] + 1) % 3

    setVariants((current) => ({
      ...current,
      [platform]: next,
    }))

    setPosts((current) => ({
      ...current,
      [platform]: makePost(campaign, platform, next),
    }))
  }

  return (
    <div className="asset-editor">
      <div
        className="asset-tabs"
        role="group"
        aria-label="Post platform"
      >
        {(['x', 'linkedin', 'instagram'] as const).map(
          (value) => (
            <button
              key={value}
              type="button"
              aria-pressed={platform === value}
              onClick={() => setPlatform(value)}
            >
              {value === 'x'
                ? 'X / Twitter'
                : value === 'linkedin'
                  ? 'LinkedIn'
                  : 'Instagram'}
            </button>
          ),
        )}
      </div>

      <label htmlFor="asset-post">Edit your post</label>

      <textarea
        id="asset-post"
        rows={12}
        value={posts[platform]}
        onChange={(event) =>
          setPosts((current) => ({
            ...current,
            [platform]: event.target.value,
          }))
        }
      />

      <p className="draft-note">
        {Array.from(posts[platform]).length} characters
      </p>

      <div className="asset-toolbar">
        <CopyButton text={posts[platform]} />

        <button
          type="button"
          className="asset-secondary"
          onClick={anotherWay}
        >
          ↻ Another way
        </button>
      </div>

      <p className="draft-note">
        Based on your saved campaign. Another way cycles
        through three draft layouts.
      </p>
    </div>
  )
}