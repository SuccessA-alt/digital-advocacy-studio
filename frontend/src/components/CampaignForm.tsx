import { useState, type SyntheticEvent } from 'react'

import {
  ApiError,
  createCampaign,
} from '../api'

import type {
  Campaign,
  CampaignPayload,
  Sdg,
} from '../types'

interface CampaignFormProps {
  sdgs: Sdg[]
  onCampaignCreated: (campaign: Campaign) => void
}

const emptyCampaign: CampaignPayload = {
  title: '',
  problem: '',
  sdgId: null,
  desiredOutcome: '',
  coreMessage: '',
  sharingMethod: '',
  decisionMaker: '',
  firstMoves: '',
  successMeasures: '',
}

const stepNames = [
  'Describe',
  'Message',
  'Plan',
  'Success',
]

export default function CampaignForm({
  sdgs,
  onCampaignCreated,
}: CampaignFormProps) {
  const [step, setStep] = useState<number>(1)

  const [campaign, setCampaign] =
    useState<CampaignPayload>({
      ...emptyCampaign,
    })

  const [fieldErrors, setFieldErrors] =
    useState<Record<string, string>>({})

  const [generalError, setGeneralError] =
    useState<string>('')

  const [isSaving, setIsSaving] =
    useState<boolean>(false)

  function updateField(
    field: keyof CampaignPayload,
    value: string | number | null,
  ) {
    setCampaign((currentCampaign) => ({
      ...currentCampaign,
      [field]: value,
    }))

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }))
  }

  function goToNextStep() {
    setGeneralError('')

    setStep((currentStep) =>
      Math.min(currentStep + 1, 4),
    )
  }

  function goToPreviousStep() {
    setGeneralError('')

    setStep((currentStep) =>
      Math.max(currentStep - 1, 1),
    )
  }

  function moveToStepContainingError(
    errors: Record<string, string>,
  ) {
    const errorFields = Object.keys(errors)

    if (
      errorFields.includes('title') ||
      errorFields.includes('problem') ||
      errorFields.includes('sdgId')
    ) {
      setStep(1)
      return
    }

    if (
      errorFields.includes('desiredOutcome') ||
      errorFields.includes('coreMessage') ||
      errorFields.includes('sharingMethod')
    ) {
      setStep(2)
      return
    }

    if (
      errorFields.includes('decisionMaker') ||
      errorFields.includes('firstMoves')
    ) {
      setStep(3)
      return
    }

    if (errorFields.includes('successMeasures')) {
      setStep(4)
    }
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setIsSaving(true)
    setGeneralError('')
    setFieldErrors({})

    try {
      const savedCampaign =
        await createCampaign(campaign)

      onCampaignCreated(savedCampaign)

      setCampaign({
        ...emptyCampaign,
      })

      setStep(1)
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setGeneralError(error.message)
        setFieldErrors(error.fieldErrors)

        moveToStepContainingError(
          error.fieldErrors,
        )
      } else {
        setGeneralError(
          'The campaign could not be saved. Please try again.',
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="campaign-builder">
      <h2>Build your advocacy campaign</h2>

      <p>
        Work through the four steps. Your campaign
        will only be saved when you select
        Create campaign.
      </p>

      <div
        aria-label="Campaign steps"
        className="step-indicator"
      >
        {stepNames.map((stepName, index) => {
          const stepNumber = index + 1
          const isCurrentStep =
            stepNumber === step

          return (
            <button
              aria-current={
                isCurrentStep
                  ? 'step'
                  : undefined
              }
              className={
                isCurrentStep
                  ? 'step-button active'
                  : 'step-button'
              }
              key={stepName}
              onClick={() =>
                setStep(stepNumber)
              }
              type="button"
            >
              <span>{stepNumber}</span>
              {stepName}
            </button>
          )
        })}
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
      >
        {step === 1 && (
          <fieldset>
            <legend>
              Step 1: Describe your campaign
            </legend>

            <p>
              Start with the issue you care
              about. You can optionally connect
              it to a Sustainable Development
              Goal.
            </p>

            <label htmlFor="title">
              Campaign title
            </label>

            <input
              id="title"
              maxLength={120}
              name="title"
              onChange={(event) =>
                updateField(
                  'title',
                  event.target.value,
                )
              }
              placeholder="For example: Cleaner Local Parks"
              type="text"
              value={campaign.title}
            />

            {fieldErrors.title && (
              <p className="field-error">
                {fieldErrors.title}
              </p>
            )}

            <label htmlFor="problem">
              Describe the problem
            </label>

            <textarea
              id="problem"
              name="problem"
              onChange={(event) =>
                updateField(
                  'problem',
                  event.target.value,
                )
              }
              placeholder="What is happening, who is affected and why does it matter?"
              rows={6}
              value={campaign.problem}
            />

            {fieldErrors.problem && (
              <p className="field-error">
                {fieldErrors.problem}
              </p>
            )}

            <label htmlFor="sdgId">
              Sustainable Development Goal
              <span> — optional</span>
            </label>

            <select
              id="sdgId"
              name="sdgId"
              onChange={(event) => {
                const selectedValue =
                  event.target.value

                updateField(
                  'sdgId',
                  selectedValue === ''
                    ? null
                    : Number(selectedValue),
                )
              }}
              value={campaign.sdgId ?? ''}
            >
              <option value="">
                No SDG selected
              </option>

              {sdgs.map((sdg) => (
                <option
                  key={sdg.id}
                  value={sdg.id}
                >
                  Goal {sdg.goalNumber}:{' '}
                  {sdg.name}
                </option>
              ))}
            </select>

            {fieldErrors.sdgId && (
              <p className="field-error">
                {fieldErrors.sdgId}
              </p>
            )}
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend>
              Step 2: Shape your message
            </legend>

            <label htmlFor="desiredOutcome">
              What do you want to achieve?
            </label>

            <textarea
              id="desiredOutcome"
              name="desiredOutcome"
              onChange={(event) =>
                updateField(
                  'desiredOutcome',
                  event.target.value,
                )
              }
              placeholder="Describe the change you want to see."
              rows={5}
              value={campaign.desiredOutcome}
            />

            {fieldErrors.desiredOutcome && (
              <p className="field-error">
                {fieldErrors.desiredOutcome}
              </p>
            )}

            <label htmlFor="coreMessage">
              What is your core message?
            </label>

            <textarea
              id="coreMessage"
              name="coreMessage"
              onChange={(event) =>
                updateField(
                  'coreMessage',
                  event.target.value,
                )
              }
              placeholder="Write the main message people should remember."
              rows={5}
              value={campaign.coreMessage}
            />

            {fieldErrors.coreMessage && (
              <p className="field-error">
                {fieldErrors.coreMessage}
              </p>
            )}

            <label htmlFor="sharingMethod">
              How will you share it?
            </label>

            <textarea
              id="sharingMethod"
              name="sharingMethod"
              onChange={(event) =>
                updateField(
                  'sharingMethod',
                  event.target.value,
                )
              }
              placeholder="For example: social media, meetings or community events."
              rows={4}
              value={campaign.sharingMethod}
            />

            {fieldErrors.sharingMethod && (
              <p className="field-error">
                {fieldErrors.sharingMethod}
              </p>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend>
              Step 3: Plan your first action
            </legend>

            <label htmlFor="decisionMaker">
              Who can make this change?
            </label>

            <input
              id="decisionMaker"
              maxLength={255}
              name="decisionMaker"
              onChange={(event) =>
                updateField(
                  'decisionMaker',
                  event.target.value,
                )
              }
              placeholder="For example: the local council"
              type="text"
              value={campaign.decisionMaker}
            />

            {fieldErrors.decisionMaker && (
              <p className="field-error">
                {fieldErrors.decisionMaker}
              </p>
            )}

            <label htmlFor="firstMoves">
              What is your first move?
            </label>

            <textarea
              id="firstMoves"
              name="firstMoves"
              onChange={(event) =>
                updateField(
                  'firstMoves',
                  event.target.value,
                )
              }
              placeholder="Describe the first practical action you will take."
              rows={6}
              value={campaign.firstMoves}
            />

            {fieldErrors.firstMoves && (
              <p className="field-error">
                {fieldErrors.firstMoves}
              </p>
            )}
          </fieldset>
        )}

        {step === 4 && (
          <fieldset>
            <legend>
              Step 4: Define success
            </legend>

            <label htmlFor="successMeasures">
              How will you measure success?
            </label>

            <textarea
              id="successMeasures"
              name="successMeasures"
              onChange={(event) =>
                updateField(
                  'successMeasures',
                  event.target.value,
                )
              }
              placeholder="What visible or measurable change will show that the campaign is working?"
              rows={7}
              value={campaign.successMeasures}
            />

            {fieldErrors.successMeasures && (
              <p className="field-error">
                {fieldErrors.successMeasures}
              </p>
            )}
          </fieldset>
        )}

        {generalError && (
          <div
            className="error-summary"
            role="alert"
          >
            {generalError}
          </div>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button
              disabled={isSaving}
              onClick={goToPreviousStep}
              type="button"
            >
              Previous
            </button>
          )}

          {step < 4 ? (
            <button
              disabled={isSaving}
              onClick={goToNextStep}
              type="button"
            >
              Continue
            </button>
          ) : (
            <button
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? 'Saving campaign...'
                : 'Create campaign'}
            </button>
          )}
        </div>
      </form>
    </section>
  )
}