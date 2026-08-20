export type Sdg = {
  id: number
  goalNumber: number
  name: string
}

export type CampaignPayload = {
  title: string
  problem: string
  sdgId: number | null
  desiredOutcome: string
  coreMessage: string
  sharingMethod: string
  decisionMaker: string
  firstMoves: string
  successMeasures: string
}

export type Campaign = {
  id: number
  title: string
  problem: string
  sdg: Sdg | null
  desiredOutcome: string
  coreMessage: string
  sharingMethod: string
  decisionMaker: string
  firstMoves: string
  successMeasures: string
  createdAt: string
  updatedAt: string
}

export type ValidationErrorResponse = {
  message: string
  errors?: Record<string, string>
}

export type AiReviewResponse = {
  review: string
}