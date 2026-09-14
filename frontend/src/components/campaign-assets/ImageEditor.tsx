import { useEffect, useRef, useState } from 'react'
import type { Campaign } from '../../types'
import CopyButton from './CopyButton'
import { makePost, shorten } from './assetDrafts'
import { downloadFile, readLocalImage } from './assetFiles'
import { formats, goalColours } from './imageConfig'
import type { ImageSettings, Template, TextPosition } from './imageConfig'
import { paintImage, photoGeometry } from './imageCanvas'

export default function ImageEditor({
  campaign,
}: {
  campaign: Campaign
}) {
  const goalColour =
    goalColours[(campaign.sdg?.goalNumber ?? 0) - 1] ??
    '#5b48ce'

  const [settings, setSettings] =
    useState<ImageSettings>(() => ({
      format: 'square',
      template: 'gradient',
      colour: goalColour,
      headline: shorten(
        campaign.desiredOutcome || campaign.title,
        140,
      ),
      supporting: shorten(
        campaign.coreMessage || campaign.problem,
        220,
      ),
      signoff: '',
      position: 'bottom',
      shade: 0.4,
      goalBar: Boolean(campaign.sdg),
      zoom: 1,
      rotation: 0,
      panX: 50,
      panY: 50,
    }))

  const [photo, setPhoto] =
    useState<HTMLImageElement | null>(null)

  const [logo, setLogo] =
    useState<HTMLImageElement | null>(null)

  const [loading, setLoading] = useState({
    photo: false,
    logo: false,
  })

  const [error, setError] = useState('')

  const [caption, setCaption] = useState(() =>
    makePost(campaign, 'instagram', 0),
  )

  const [captionVariant, setCaptionVariant] =
    useState(0)

  const [description, setDescription] =
    useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const requests = useRef({
    photo: 0,
    logo: 0,
  })

  const drag = useRef<{
    x: number
    y: number
    panX: number
    panY: number
  } | null>(null)

  const imageDescription =
    description ??
    [
      'Campaign graphic.',
      settings.headline,
      settings.supporting,
      settings.signoff,
    ]
      .filter(Boolean)
      .join(' ')

  const busy = loading.photo || loading.logo

  useEffect(() => {
    if (canvasRef.current) {
      paintImage(
        canvasRef.current,
        settings,
        photo,
        logo,
        goalColour,
      )
    }
  }, [settings, photo, logo, goalColour])

  function update<K extends keyof ImageSettings>(
    key: K,
    value: ImageSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function chooseImage(
    file: File | undefined,
    kind: 'photo' | 'logo',
  ) {
    if (!file) return

    const request = ++requests.current[kind]

    setLoading((current) => ({
      ...current,
      [kind]: true,
    }))

    setError('')

    try {
      if (
        ![
          'image/png',
          'image/jpeg',
          'image/webp',
        ].includes(file.type)
      ) {
        throw new Error(
          'Choose a PNG, JPEG or WebP image.',
        )
      }

      if (file.size > 15 * 1024 * 1024) {
        throw new Error(
          'Choose an image smaller than 15 MB.',
        )
      }

      const image = await readLocalImage(file)

      if (request !== requests.current[kind]) return

      if (kind === 'photo') {
        setPhoto(image)

        setSettings((current) => ({
          ...current,
          zoom: 1,
          rotation: 0,
          panX: 50,
          panY: 50,
        }))
      } else {
        setLogo(image)
      }
    } catch (reason: unknown) {
      if (request === requests.current[kind]) {
        setError(
          reason instanceof Error
            ? reason.message
            : 'The image could not be loaded.',
        )
      }
    } finally {
      if (request === requests.current[kind]) {
        setLoading((current) => ({
          ...current,
          [kind]: false,
        }))
      }
    }
  }

  function removeImage(kind: 'photo' | 'logo') {
    requests.current[kind] += 1

    setLoading((current) => ({
      ...current,
      [kind]: false,
    }))

    if (kind === 'photo') {
      setPhoto(null)
    } else {
      setLogo(null)
    }
  }

  function downloadImage() {
    const canvas = canvasRef.current

    if (!canvas || busy) return

    setError('')

    try {
      if (!canvas.getContext('2d')) {
        throw new Error(
          'Your browser could not create the image.',
        )
      }

      paintImage(
        canvas,
        settings,
        photo,
        logo,
        goalColour,
      )

      canvas.toBlob((blob) => {
        if (blob) {
          downloadFile(
            blob,
            'campaign-' +
              campaign.id +
              '-' +
              settings.format +
              '.png',
          )
        } else {
          setError(
            'The image could not be downloaded. Please try again.',
          )
        }
      }, 'image/png')
    } catch {
      setError(
        'The image could not be downloaded. Please try again.',
      )
    }
  }

  return (
    <div className="asset-editor">
      <p className="draft-note">
        Your photo stays in this browser. Upload a photo
        or build a graphic from a template.
      </p>

      {error && (
        <p className="error-summary" role="alert">
          {error}
        </p>
      )}

      <div className="asset-image-layout">
        <div className="asset-controls">
          <label htmlFor="asset-photo">
            Background photo
          </label>

          <input
            id="asset-photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              void chooseImage(
                event.target.files?.[0],
                'photo',
              )

              event.target.value = ''
            }}
          />

          <button
            type="button"
            className="asset-secondary"
            onClick={() => removeImage('photo')}
          >
            Use template background
          </button>

          <label htmlFor="asset-template">
            Template
          </label>

          <select
            id="asset-template"
            value={settings.template}
            onChange={(event) => {
              update(
                'template',
                event.target.value as Template,
              )

              removeImage('photo')
            }}
          >
            <option value="gradient">Gradient</option>
            <option value="solid">Solid colour</option>
            <option value="split">Split</option>
            <option value="frame">Frame</option>
            <option value="dots">Dots</option>
          </select>

          <label htmlFor="asset-colour">Colour</label>

          <input
            id="asset-colour"
            type="color"
            value={settings.colour}
            onChange={(event) =>
              update('colour', event.target.value)
            }
          />

          <button
            type="button"
            className="asset-secondary"
            disabled={!campaign.sdg}
            onClick={() => update('colour', goalColour)}
          >
            Use goal colour
          </button>

          <label htmlFor="asset-size">Size</label>

          <select
            id="asset-size"
            value={settings.format}
            onChange={(event) =>
              update(
                'format',
                event.target.value as keyof typeof formats,
              )
            }
          >
            {Object.entries(formats).map(
              ([key, format]) => (
                <option key={key} value={key}>
                  {format.label} · {format.width} ×{' '}
                  {format.height}
                </option>
              ),
            )}
          </select>

          <label htmlFor="asset-zoom">
            Photo zoom · {settings.zoom.toFixed(1)}×
          </label>

          <input
            id="asset-zoom"
            type="range"
            min="1"
            max="3"
            step="0.1"
            disabled={!photo}
            value={settings.zoom}
            onChange={(event) =>
              update('zoom', Number(event.target.value))
            }
          />

          <button
            type="button"
            className="asset-secondary"
            disabled={!photo}
            onClick={() => {
              setSettings((current) => ({
                ...current,
                rotation:
                  (current.rotation + 90) % 360,
                panX: 50,
                panY: 50,
              }))
            }}
          >
            ↻ Rotate photo
          </button>

          <label htmlFor="asset-pan-x">
            Photo horizontal position
          </label>

          <input
            id="asset-pan-x"
            type="range"
            min="0"
            max="100"
            disabled={!photo}
            value={settings.panX}
            onChange={(event) =>
              update('panX', Number(event.target.value))
            }
          />

          <label htmlFor="asset-pan-y">
            Photo vertical position
          </label>

          <input
            id="asset-pan-y"
            type="range"
            min="0"
            max="100"
            disabled={!photo}
            value={settings.panY}
            onChange={(event) =>
              update('panY', Number(event.target.value))
            }
          />

          <label htmlFor="asset-headline">
            Headline
          </label>

          <textarea
            id="asset-headline"
            rows={3}
            maxLength={160}
            value={settings.headline}
            onChange={(event) =>
              update('headline', event.target.value)
            }
          />

          <label htmlFor="asset-supporting">
            Supporting line
          </label>

          <textarea
            id="asset-supporting"
            rows={3}
            maxLength={240}
            value={settings.supporting}
            onChange={(event) =>
              update('supporting', event.target.value)
            }
          />

          <label htmlFor="asset-signoff">
            Handle / sign-off
          </label>

          <input
            id="asset-signoff"
            maxLength={70}
            placeholder="@yourcampaign"
            value={settings.signoff}
            onChange={(event) =>
              update('signoff', event.target.value)
            }
          />

          <label htmlFor="asset-position">
            Text position
          </label>

          <select
            id="asset-position"
            value={settings.position}
            onChange={(event) =>
              update(
                'position',
                event.target.value as TextPosition,
              )
            }
          >
            <option value="top">Top</option>
            <option value="centre">Centre</option>
            <option value="bottom">Bottom</option>
          </select>

          <label htmlFor="asset-shade">
            Readability shade ·{' '}
            {Math.round(settings.shade * 100)}%
          </label>

          <input
            id="asset-shade"
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={settings.shade}
            onChange={(event) =>
              update('shade', Number(event.target.value))
            }
          />

          <label className="asset-checkbox">
            <input
              type="checkbox"
              disabled={!campaign.sdg}
              checked={settings.goalBar}
              onChange={(event) =>
                update('goalBar', event.target.checked)
              }
            />
            Goal colour bar
          </label>

          <label htmlFor="asset-logo">
            Logo (optional)
          </label>

          <input
            id="asset-logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              void chooseImage(
                event.target.files?.[0],
                'logo',
              )

              event.target.value = ''
            }}
          />

          <button
            type="button"
            className="asset-secondary"
            onClick={() => removeImage('logo')}
          >
            Remove logo
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={downloadImage}
          >
            {busy ? 'Loading image…' : 'Download image'}
          </button>
        </div>

        <div className="asset-preview-column">
          <div className="asset-preview">
            <canvas
              ref={canvasRef}
              className="asset-canvas"
              role="img"
              aria-label={
                imageDescription || 'Campaign image preview'
              }
              style={{
                touchAction: photo ? 'none' : 'auto',
              }}
              onPointerDown={(event) => {
                if (!photo) return

                drag.current = {
                  x: event.clientX,
                  y: event.clientY,
                  panX: settings.panX,
                  panY: settings.panY,
                }

                event.currentTarget.setPointerCapture(
                  event.pointerId,
                )
              }}
              onPointerMove={(event) => {
                if (!drag.current || !photo) return

                const rect =
                  event.currentTarget.getBoundingClientRect()

                const geometry = photoGeometry(
                  photo,
                  settings,
                )

                const format = formats[settings.format]

                const dx = geometry.excessX
                  ? (event.clientX - drag.current.x) /
                    rect.width *
                    format.width /
                    geometry.excessX *
                    100
                  : 0

                const dy = geometry.excessY
                  ? (event.clientY - drag.current.y) /
                    rect.height *
                    format.height /
                    geometry.excessY *
                    100
                  : 0

                const panX = Math.max(
                  0,
                  Math.min(100, drag.current.panX + dx),
                )

                const panY = Math.max(
                  0,
                  Math.min(100, drag.current.panY + dy),
                )

                setSettings((current) => ({
                  ...current,
                  panX,
                  panY,
                }))
              }}
              onPointerUp={() => {
                drag.current = null
              }}
              onPointerCancel={() => {
                drag.current = null
              }}
              onLostPointerCapture={() => {
                drag.current = null
              }}
            />
          </div>

          <p className="draft-note">
            Drag your photo to reposition it, or use
            the position sliders.
          </p>

          <label htmlFor="asset-caption">
            Caption — edit, then copy
          </label>

          <textarea
            id="asset-caption"
            rows={10}
            value={caption}
            onChange={(event) =>
              setCaption(event.target.value)
            }
          />

          <div className="asset-toolbar">
            <CopyButton
              text={caption}
              label="Copy caption"
            />

            <button
              type="button"
              className="asset-secondary"
              onClick={() => {
                const next = (captionVariant + 1) % 3

                setCaptionVariant(next)

                setCaption(
                  makePost(campaign, 'instagram', next),
                )
              }}
            >
              ↻ Another way
            </button>
          </div>

          <label htmlFor="asset-description">
            Image description — include what is in
            your photo
          </label>

          <textarea
            id="asset-description"
            rows={4}
            value={imageDescription}
            onChange={(event) =>
              setDescription(event.target.value)
            }
          />

          <CopyButton
            text={imageDescription}
            label="Copy image description"
          />

          <p className="draft-note">
            Add this description in the social platform’s
            alt-text field when uploading your image.
          </p>
        </div>
      </div>
    </div>
  )
}