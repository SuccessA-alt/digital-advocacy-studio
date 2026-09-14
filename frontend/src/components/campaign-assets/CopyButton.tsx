import { useState } from 'react'

export default function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string
  label?: string
}) {
  const [copiedText, setCopiedText] =
    useState<string | null>(null)

  const [error, setError] = useState('')

  async function copy() {
    setError('')

    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
    } catch {
      setCopiedText(null)
      setError(
        'Copy was unavailable. Select the text and press Ctrl+C.',
      )
    }
  }

  return (
    <div className="asset-copy">
      <button
        type="button"
        disabled={!text.trim()}
        onClick={() => void copy()}
      >
        {copiedText === text ? 'Copied' : label}
      </button>

      <span role="status">{error}</span>
    </div>
  )
}