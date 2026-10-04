import type {
  AiReviewResponse,
  Campaign,
  CampaignDraftRequest,
  CampaignDraftResponse,
  CampaignPayload,
  CampaignVersion,
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

export type AuthStatus = {
  authenticated: boolean
  accountId: number | null
  name: string | null
  email: string | null
}

type CsrfDetails = {
  headerName: string
  token: string
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers)
  const method = (options.method ?? 'GET').toUpperCase()

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const tokenResponse = await fetch(`${API_BASE}/auth/csrf`, {
      credentials: 'same-origin',
      cache: 'no-store',
    })

    if (!tokenResponse.ok) {
      throw new ApiError(
        'Could not prepare this request. Please try again.',
        tokenResponse.status,
      )
    }

    const csrf = (await tokenResponse.json()) as CsrfDetails
    headers.set(csrf.headerName, csrf.token)
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
  })
}

/* This The shared request() function, handles the response and throws an ApiError if the request fails */
async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await apiFetch(path, options)

  if (!response.ok) {
    let errorBody: ValidationErrorResponse | undefined

    try {
      errorBody = (await response.json()) as ValidationErrorResponse
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

export function getAuthStatus(): Promise<AuthStatus> {
  return request<AuthStatus>('/auth/me')
}

export function signOut(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' })
}

export function getSdgs(): Promise<Sdg[]> {
  return request<Sdg[]>('/sdgs')
}

export function getCampaigns(): Promise<Campaign[]> {
  return request<Campaign[]>('/campaigns')
}

export function getCampaign(id: number): Promise<Campaign> {
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

export function deleteCampaign(id: number): Promise<void> {
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
  campaign: Campaign,
): Promise<void> {
  const isDraft = campaign.id === null
  const path = isDraft
    ? '/campaigns/draft/pdf'
    : `/campaigns/${campaign.id}/pdf`

  const response = await apiFetch(
    path,
    isDraft
      ? {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: campaign.title,
            problem: campaign.problem,
            sdgId: campaign.sdg?.id ?? null,
            desiredOutcome: campaign.desiredOutcome,
            coreMessage: campaign.coreMessage,
            sharingMethod: campaign.sharingMethod,
            decisionMaker: campaign.decisionMaker,
            advocacyPlan: campaign.advocacyPlan,
            successMeasures: campaign.successMeasures,
          }),
        }
      : undefined,
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
  link.download = isDraft
    ? 'campaign-draft.pdf'
    : `campaign-${campaign.id}.pdf`

  try {
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000)
  }
}

/* This function calls the This function sends the problem to /api/ai/draft.
It uses POST because we are submitting information for the backend to process.
 JSON.stringify() converts that information into the format sent in the request.” */
export function generateCampaignDraft(
  draftRequest: CampaignDraftRequest,
): Promise<CampaignDraftResponse> {
  return request<CampaignDraftResponse>('/ai/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draftRequest),
  })
}

export function getCampaignVersions(
  campaignId: number,
): Promise<CampaignVersion[]> {
  return request<CampaignVersion[]>(
    `/campaigns/${campaignId}/versions`,
  )
}

export function getCampaignVersion(
  campaignId: number,
  versionId: number,
): Promise<CampaignVersion> {
  return request<CampaignVersion>(
    `/campaigns/${campaignId}/versions/${versionId}`,
  )
}

export async function downloadCampaignVersionPdf(
  version: CampaignVersion,
): Promise<void> {
  const response = await apiFetch(
    `/campaigns/${version.campaignId}/versions/${version.id}/pdf`,
  )

  if (!response.ok) {
    throw new ApiError(
      'Could not download this campaign version as a PDF.',
      response.status,
    )
  }

  const pdfBlob = await response.blob()
  const downloadUrl = URL.createObjectURL(pdfBlob)
  const link = document.createElement('a')

  link.href = downloadUrl
  link.download =
    `campaign-${version.campaignId}-version-${version.versionNumber}.pdf`

  try {
    document.body.appendChild(link)
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000)
  }
}