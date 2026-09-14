import { formats } from './imageConfig'
import type { ImageSettings } from './imageConfig'

function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
) {
  const lines: string[] = []
  let line = ''

  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    const candidate = line ? line + ' ' + word : word

    if (context.measureText(candidate).width <= width) {
      line = candidate
      continue
    }

    if (line) lines.push(line)
    line = ''

    for (const character of Array.from(word)) {
      if (
        line &&
        context.measureText(line + character).width > width
      ) {
        lines.push(line)
        line = ''
      }

      line += character
    }
  }

  if (line) lines.push(line)
  return lines
}

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  initialSize: number,
  weight: number,
) {
  let size = initialSize
  let lines: string[]

  do {
    context.font =
      weight + ' ' + size + 'px Arial, sans-serif'

    lines = wrapLines(context, text, width)

    if (
      lines.length * size * 1.2 <= height ||
      size <= 12
    ) {
      break
    }

    size -= 1
  } while (size >= 12)

  return {
    lines,
    size,
    height: lines.length * size * 1.2,
    weight,
  }
}

export function photoGeometry(
  photo: HTMLImageElement,
  settings: ImageSettings,
) {
  const { width, height } = formats[settings.format]

  const sideways = settings.rotation % 180 !== 0

  const rotatedWidth = sideways
    ? photo.naturalHeight
    : photo.naturalWidth

  const rotatedHeight = sideways
    ? photo.naturalWidth
    : photo.naturalHeight

  const scale =
    Math.max(
      width / rotatedWidth,
      height / rotatedHeight,
    ) * settings.zoom

  return {
    scale,
    excessX: Math.max(0, rotatedWidth * scale - width),
    excessY: Math.max(0, rotatedHeight * scale - height),
  }
}

export function paintImage(
  canvas: HTMLCanvasElement,
  settings: ImageSettings,
  photo: HTMLImageElement | null,
  logo: HTMLImageElement | null,
  goalColour: string,
) {
  const context = canvas.getContext('2d')
  if (!context) return

  const { width, height } = formats[settings.format]

  canvas.width = width
  canvas.height = height

  const unit = Math.min(width, height) / 1080
  const padding = 70 * unit

  context.fillStyle = settings.colour
  context.fillRect(0, 0, width, height)

  if (photo) {
    const geometry = photoGeometry(photo, settings)

    context.save()

    context.translate(
      width / 2 +
        (settings.panX / 100 - 0.5) * geometry.excessX,
      height / 2 +
        (settings.panY / 100 - 0.5) * geometry.excessY,
    )

    context.rotate(
      settings.rotation * Math.PI / 180,
    )

    context.drawImage(
      photo,
      -photo.naturalWidth * geometry.scale / 2,
      -photo.naturalHeight * geometry.scale / 2,
      photo.naturalWidth * geometry.scale,
      photo.naturalHeight * geometry.scale,
    )

    context.restore()
  } else if (settings.template === 'gradient') {
    const gradient = context.createLinearGradient(
      0,
      0,
      width,
      height,
    )

    gradient.addColorStop(0, settings.colour)
    gradient.addColorStop(1, '#24213b')

    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
  } else if (settings.template === 'split') {
    context.fillStyle = '#24213b'

    context.fillRect(
      0,
      height * 0.3,
      width,
      height * 0.7,
    )
  } else if (settings.template === 'frame') {
    context.fillStyle = '#24213b'

    context.fillRect(
      padding / 2,
      padding / 2,
      width - padding,
      height - padding,
    )
  } else if (settings.template === 'dots') {
    context.fillStyle = '#24213b'
    context.fillRect(0, 0, width, height)
    context.fillStyle = settings.colour

    for (
      let x = padding;
      x < width * 0.5;
      x += 32 * unit
    ) {
      for (
        let y = padding;
        y < height * 0.25;
        y += 32 * unit
      ) {
        context.beginPath()
        context.arc(x, y, 6 * unit, 0, Math.PI * 2)
        context.fill()
      }
    }
  }

  context.fillStyle =
    'rgba(0, 0, 0, ' + settings.shade + ')'

  context.fillRect(0, 0, width, height)

  if (settings.goalBar) {
    context.fillStyle = goalColour

    context.fillRect(
      0,
      height - 22 * unit,
      width,
      22 * unit,
    )
  }

  let logoHeight = 0

  if (logo) {
    const scale = Math.min(
      width * 0.17 / logo.naturalWidth,
      height * 0.1 / logo.naturalHeight,
    )

    const logoWidth = logo.naturalWidth * scale
    logoHeight = logo.naturalHeight * scale

    context.drawImage(
      logo,
      width - padding - logoWidth,
      padding,
      logoWidth,
      logoHeight,
    )
  }

  const headline = fitText(
    context,
    settings.headline,
    width - 2 * padding,
    height * 0.28,
    70 * unit,
    700,
  )

  const supporting = fitText(
    context,
    settings.supporting,
    width - 2 * padding,
    height * 0.2,
    34 * unit,
    400,
  )

  const gap =
    headline.height && supporting.height
      ? 24 * unit
      : 0

  const totalHeight =
    headline.height + supporting.height + gap

  const topLimit =
    padding + (logo ? logoHeight + padding / 2 : 0)

  const bottomLimit =
    height - padding - 60 * unit

  let y =
    settings.position === 'top'
      ? topLimit
      : settings.position === 'centre'
        ? (height - totalHeight) / 2
        : bottomLimit - totalHeight

  y = Math.max(
    topLimit,
    Math.min(y, bottomLimit - totalHeight),
  )

  context.fillStyle = '#ffffff'
  context.textBaseline = 'top'

  for (const block of [headline, supporting]) {
    context.font =
      block.weight +
      ' ' +
      block.size +
      'px Arial, sans-serif'

    for (const line of block.lines) {
      context.fillText(line, padding, y)
      y += block.size * 1.2
    }

    if (block === headline) y += gap
  }

  context.textAlign = 'right'
  context.font =
    '600 ' + 25 * unit + 'px Arial, sans-serif'

  context.fillText(
    settings.signoff,
    width - padding,
    height - padding,
    width - 2 * padding,
  )
}