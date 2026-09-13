import { useState, type SyntheticEvent } from 'react'

import {
  ApiError,
  createCampaign,
  generateCampaignDraft,
  updateCampaign,
} from '../api'

import type {
  Campaign,
  CampaignPayload,
  Sdg,
} from '../types'

interface CampaignFormProps {
  isActive?: boolean
  sdgs: Sdg[]
  initialCampaign?: Campaign
  onBackToWelcome: () => void
  onCampaignSaved: (campaign: Campaign) => void
}

const emptyCampaign: CampaignPayload = {
  title: '',
  problem: '',
  sdgId: null,
  desiredOutcome: '',
  coreMessage: '',
  sharingMethod: '',
  decisionMaker: '',
  advocacyPlan: '',
  successMeasures: '',
}

const stepNames = [
  'Describe',
  'Message',
  'Plan',
  'Success',
]

const sdgColours: Record<number, string> = {
  1: '#f8c8d2',
  2: '#f3dfb2',
  3: '#c8e2c3',
  4: '#f0bdc8',
  5: '#ffc9c3',
  6: '#bceaf5',
  7: '#ffedaa',
  8: '#e8bdce',
  9: '#ffd0b5',
  10: '#f5bdd8',
  11: '#ffdbad',
  12: '#e5d2ae',
  13: '#c4dbc9',
  14: '#bce0f3',
  15: '#d0e9bb',
  16: '#bfd5e6',
  17: '#c9d2e2',
}


const draftFields = [
  { name: 'title', label: 'Campaign title', step: 2, maxLength: 120, rows: 1 },
  { name: 'desiredOutcome', label: 'What do you want to achieve?', step: 2, maxLength: 5000, rows: 5 },
  { name: 'coreMessage', label: 'What is your core message?', step: 2, maxLength: 5000, rows: 5 },
  { name: 'decisionMaker', label: 'Who can make this change?', step: 3, maxLength: 255, rows: 4 },
{
  name: 'advocacyPlan',
  label: 'Your advocacy plan',
  step: 3,
  maxLength: 10000,
  rows: 12,
},
  { name: 'successMeasures', label: 'How will you measure success?', step: 4, maxLength: 5000, rows: 7 },
] as const

const stageTitles = ['Describe your campaign', 'Your message', 'Your plan', 'Your success measures']

export default function CampaignForm({
  sdgs,
  initialCampaign,
  isActive = true,
  onBackToWelcome,
  onCampaignSaved,
}: CampaignFormProps) {
  const [step, setStep] = useState<number>(1)

  const [isGenerating, setIsGenerating] = useState(false)
  
  const [hasDraft, setHasDraft] = useState(Boolean(initialCampaign))

  const [showExample, setShowExample] = useState(false)

  const [campaign, setCampaign] = useState<CampaignPayload>(() =>
  initialCampaign
    ? {
        title: initialCampaign.title,
        problem: initialCampaign.problem,
        sdgId: initialCampaign.sdg?.id ?? null,
        desiredOutcome: initialCampaign.desiredOutcome,
        coreMessage: initialCampaign.coreMessage,
        sharingMethod: initialCampaign.sharingMethod ?? '',
        decisionMaker: initialCampaign.decisionMaker,
        advocacyPlan: initialCampaign.advocacyPlan,
        successMeasures: initialCampaign.successMeasures,
      }
    : { ...emptyCampaign },
)

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

  async function goToNextStep() {
    if (isGenerating || isSaving) return

    setGeneralError('')

    if (step === 1) {
      if (!campaign.problem.trim()) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          problem: 'Please describe the problem',
        }))
        return
      }

      if (campaign.problem.length > 5000) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          problem: 'Problem description must not exceed 5000 characters',
        }))
        return
      }

      if (!hasDraft) {
        setIsGenerating(true)
        setFieldErrors({})

        try {
          const draft = await generateCampaignDraft({
            problem: campaign.problem.trim(),
            sdgId: campaign.sdgId,
          })

          setCampaign((currentCampaign) => ({
            ...currentCampaign,
            ...draft,
          }))

          setHasDraft(true)
          setStep(2)
        } catch (error: unknown) {
          if (error instanceof ApiError) {
            setGeneralError(error.message)
            setFieldErrors(error.fieldErrors)
          } else {
            setGeneralError(
              'The AI draft could not be generated. Please try again.',
            )
          }
        } finally {
          setIsGenerating(false)
        }

        return
      }
    }

    setStep((currentStep) => Math.min(currentStep + 1, 4))
  }


  function goToPreviousStep() {
    if (isSaving || isGenerating) return
    setGeneralError('')
    if (step === 1) onBackToWelcome()
    else setStep(step - 1)
  }

  function moveToStepContainingError(errors: Record<string, string>) {
    if (errors.problem || errors.sdgId) {
      setStep(1)
      return
    }
    const invalidField = draftFields.find((field) => errors[field.name])
    if (invalidField) setStep(invalidField.step)
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    if (isSaving || isGenerating || step !== 4 || !hasDraft) return

    const errors: Record<string, string> = {}
    if (!campaign.problem.trim()) errors.problem = 'Please describe the problem'
    if (campaign.problem.length > 5000) errors.problem = 'Use no more than 5000 characters'
    for (const field of draftFields) {
      if (!campaign[field.name].trim()) errors[field.name] = 'Please complete this field'
      else if (campaign[field.name].length > field.maxLength) {
        errors[field.name] = `Use no more than ${field.maxLength} characters`
      }
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setGeneralError('Please complete the highlighted fields before saving.')
      moveToStepContainingError(errors)
      return
    }

    setIsSaving(true)
    setGeneralError('')
    setFieldErrors({})

    try {
     const savedCampaign = initialCampaign
  ? await updateCampaign(initialCampaign.id, campaign)
  : await createCampaign(campaign)

onCampaignSaved(savedCampaign)

if (!initialCampaign) {
  setCampaign({ ...emptyCampaign })
  setHasDraft(false)
  setShowExample(false)
  setStep(1)
}
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
  if (!isActive) return null

  return (
    <section className="campaign-builder">

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
              disabled={isSaving || isGenerating || (!hasDraft && stepNumber > 1)}
              key={stepName}
              onClick={() =>
                setStep(stepNumber)
              }
              type="button"
            >

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
          <fieldset disabled={isSaving || isGenerating}>
            <legend>
              Describe your campaign
            </legend>

            <p>
              Start with the issue you care
              about. You can optionally connect
              it to a Sustainable Development
              Goal.
            </p>

            <label htmlFor="problem">
              Describe the problem
            </label>
            <button
              className="example-toggle"
              type="button"
              aria-expanded={showExample}
              aria-controls="problem-example"
              onClick={() => setShowExample(!showExample)}
            >
              {showExample ? 'Hide example' : 'Show me an example'}
            </button>

            <p id="problem-example" hidden={!showExample}>
              Families in our neighbourhood are skipping meals because
              they cannot afford enough food. This affects low-income
              households, especially families with children. Existing
              support is difficult to find, leaving people without
              reliable help.
            </p>

            <textarea
              id="problem"
              maxLength={5000}
              aria-invalid={Boolean(fieldErrors.problem)}
              aria-describedby={fieldErrors.problem ? 'problem-error' : undefined}
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
              <p id="problem-error" className="field-error">
                {fieldErrors.problem}
              </p>
            )}

            <div
              className="sdg-picker"
              role="group"
              aria-labelledby="sdg-heading"
              aria-describedby={
                fieldErrors.sdgId
                  ? 'sdg-help sdg-error'
                  : 'sdg-help'
              }
            >
              <p id="sdg-heading" className="sdg-picker-heading">
                Connect to a Sustainable Development Goal (optional)
              </p>
              <p id="sdg-help" className="sdg-picker-help">
                Choose one goal, or continue without one.
                Select your chosen goal again to clear it.
              </p>

              <div className="sdg-options">
                {sdgs.map((sdg) => {
                  const isSelected = campaign.sdgId === sdg.id

                  return (
                    <button
                      key={sdg.id}
                      type="button"
                      className="sdg-option"
                      aria-pressed={isSelected}
                      style={{
                        backgroundColor:
                          sdgColours[sdg.goalNumber] ?? '#eeeaf8',
                      }}
                      onClick={() =>
                        updateField('sdgId', isSelected ? null : sdg.id)
                      }
                    >
                      {isSelected && <span aria-hidden="true">✓ </span>}
                      {sdg.goalNumber} · {sdg.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {fieldErrors.sdgId && (
              <p id="sdg-error" className="field-error">
                {fieldErrors.sdgId}
              </p>
            )}
          </fieldset>
        )}

        {step > 1 && (
          <fieldset disabled={isSaving || isGenerating}>
            <legend>{stageTitles[step - 1]}</legend>
            <p>These suggestions are a starting point. Type directly in any box to make them yours.</p>
            {draftFields.filter((field) => field.step === step).map((field) => {
              const error = fieldErrors[field.name]
              const inputProps = {
                id: field.name,
                name: field.name,
                value: campaign[field.name],
                maxLength: field.maxLength,
                'aria-invalid': Boolean(error),
                'aria-describedby': `${field.name}-hint${error ? ` ${field.name}-error` : ''}`,
              }
              return (
                <div className="draft-card" key={field.name}>
                  <div className="draft-card-heading">
                    <label htmlFor={field.name}>{field.label}</label>
                    <span className="draft-badge" id={`${field.name}-hint`}>AI draft, yours to edit</span>
                  </div>
                  {field.name === 'title' ? (
                    <input {...inputProps} type="text"
                      onChange={(event) => updateField(field.name, event.target.value)} />
                  ) : (
                    <textarea {...inputProps} rows={field.rows}
                      onChange={(event) => updateField(field.name, event.target.value)} />
                  )}
                  {error && <p className="field-error" id={`${field.name}-error`}>{error}</p>}
                </div>
              )
            })}
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

        {step === 1 && hasDraft && (
          <p className="draft-note">Your draft is already created. Continuing keeps your current suggestions and edits.</p>
        )}
        <div className="form-actions">
  <button
    disabled={isSaving || isGenerating}
    onClick={goToPreviousStep}
    type="button"
  >
    ← Back
  </button>

  {step < 4 ? (
    <button
      key="continue-step"
      disabled={isSaving || isGenerating}
      onClick={(event) => {
        event.preventDefault()
        void goToNextStep()
      }}
      type="button"
    >
      {isGenerating
        ? 'Building your campaign draft…'
        : 'Continue →'}
    </button>
  ) : (
    <button
      key="save-campaign"
      disabled={isSaving || isGenerating || !hasDraft}
      type="submit"
    >
{isSaving
  ? 'Saving…'
  : initialCampaign
    ? 'Save changes'
    : 'Create campaign plan →'}    </button>
  )}
</div>
        {isGenerating && <p role="status" className="draft-note">Building your campaign draft...</p>}
      </form>
    </section>
  )
}
