import type {
  AiReviewResponse,
  Campaign,
  CampaignPayload,
  Sdg,
  ValidationErrorResponse,
} from './types'

const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(
    message: string,
    status: number,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_BASE}${path}`,
    options,
  )

  if (!response.ok) {
    let errorBody: ValidationErrorResponse | undefined

    try {
      errorBody =
        (await response.json()) as ValidationErrorResponse
    } catch {
      errorBody = undefined
    }

    throw new ApiError(
      errorBody?.message ??
        `Request failed with status ${response.status}`,
      response.status,
      errorBody?.errors,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function getSdgs(): Promise<Sdg[]> {
  return request<Sdg[]>('/sdgs')
}

export function getCampaigns(): Promise<Campaign[]> {
  return request<Campaign[]>('/campaigns')
}

export function getCampaign(
  id: number,
): Promise<Campaign> {
  return request<Campaign>(`/campaigns/${id}`)
}

export function createCampaign(
  campaign: CampaignPayload,
): Promise<Campaign> {
  return request<Campaign>('/campaigns', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaign),
  })
}

export function updateCampaign(
  id: number,
  campaign: CampaignPayload,
): Promise<Campaign> {
  return request<Campaign>(`/campaigns/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaign),
  })
}

export function deleteCampaign(
  id: number,
): Promise<void> {
  return request<void>(`/campaigns/${id}`, {
    method: 'DELETE',
  })
}

export function reviewCampaign(
  campaign: CampaignPayload,
): Promise<AiReviewResponse> {
  return request<AiReviewResponse>('/ai/review', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(campaign),
  })
}

export async function downloadCampaignPdf(
  id: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/campaigns/${id}/pdf`,
  )

  if (!response.ok) {
    throw new ApiError(
      'Could not download the campaign PDF',
      response.status,
    )
  }

  const pdfBlob = await response.blob()
  const downloadUrl = URL.createObjectURL(pdfBlob)

  const link = document.createElement('a')

  link.href = downloadUrl
  link.download = `campaign-${id}.pdf`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(downloadUrl)
}