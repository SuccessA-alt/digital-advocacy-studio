import type { Campaign } from '../../types'

export type Platform = 'x' | 'linkedin' | 'instagram'

export function shorten(text: string, limit: number) {
  const characters = Array.from(
    text.trim().replace(/\s+/g, ' '),
  )

  if (characters.length <= limit) {
    return characters.join('')
  }

  return (
    characters
      .slice(0, limit - 1)
      .join('')
      .trimEnd() + '…'
  )
}

export function makePost(
  campaign: Campaign,
  platform: Platform,
  variant: number,
) {
  const message =
    campaign.coreMessage.trim() || campaign.title

  const problem = campaign.problem.trim()
  const outcome = campaign.desiredOutcome.trim()

  const tag = campaign.sdg
    ? '#SDG' + campaign.sdg.goalNumber
    : ''

  const openings = [
    message,
    'Here is the issue: ' + (problem || message),
    'A change worth making: ' + campaign.title,
  ]

  const opening = openings[variant % openings.length]

  if (platform === 'x') {
    return [
      shorten(opening, 155),
      outcome
        ? 'Our ask: ' + shorten(outcome, 85)
        : '',
      tag,
    ]
      .filter(Boolean)
      .join('\n')
  }

  return [
    opening,
    variant === 2 ? message : '',
    outcome
      ? 'The change we are asking for:\n' + outcome
      : '',
    platform === 'instagram'
      ? 'Share this with someone who cares about this issue.'
      : 'What could help move this forward?',
    tag,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function makeEmail(campaign: Campaign, variant: number) {
  const recipient =
    campaign.decisionMaker.trim() ||
    '[recipient name or role]'

  const introductions = [
    'I am writing about ' + campaign.title + '.',
    'I would like to ask for your support with ' +
      campaign.title +
      '.',
    'I am contacting you to request action on ' +
      campaign.title +
      '.',
  ]

  return [
    'Dear ' + recipient + ',',
    introductions[variant % introductions.length],
    campaign.problem.trim(),
    campaign.coreMessage.trim(),
    campaign.desiredOutcome.trim()
      ? 'The change I am requesting is:\n' +
        campaign.desiredOutcome.trim()
      : '',
    'Please let me know what action you can take and the next steps.',
    'Kind regards,\n[your name]',
  ]
    .filter(Boolean)
    .join('\n\n')
}