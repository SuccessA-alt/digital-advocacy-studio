import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, getAuthStatus } from '../api'
import type { AuthStatus } from '../api'

interface SignInDialogProps {
  savingCampaign: boolean
  onSignedIn: (account: AuthStatus) => void
  onCancel: () => void
}

export default function SignInDialog({
  savingCampaign,
  onSignedIn,
  onCancel,
}: SignInDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const alive = useRef(false)
  const started = useRef(false)
  const checking = useRef(false)
  const completed = useRef(false)
  const attempt = useRef(0)

  const [hasStarted, setHasStarted] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    alive.current = true
    const dialog = dialogRef.current
    dialog?.showModal()

    return () => {
      alive.current = false
      dialog?.close()
    }
  }, [])

  const finishSignIn = useCallback(async () => {
    if (!started.current || checking.current || completed.current) return

    checking.current = true
    const currentAttempt = attempt.current
    setIsChecking(true)
    setError('')

    try {
      const account = await getAuthStatus()

      if (!alive.current || currentAttempt !== attempt.current) return

      if (!account.authenticated || account.accountId === null) {
        setError(
          'Sign-in is not complete yet. Finish in the Google tab, then return here.',
        )
        return
      }

      completed.current = true
      onSignedIn(account)
    } catch (reason: unknown) {
      if (alive.current && currentAttempt === attempt.current) {
        setError(
          reason instanceof ApiError
            ? reason.message
            : 'Could not confirm sign-in. Please try again.',
        )
      }
    } finally {
      checking.current = false
      if (alive.current) setIsChecking(false)
    }
  }, [onSignedIn])

  useEffect(() => {
    let channel: BroadcastChannel | undefined

    try {
      channel = new BroadcastChannel('digital-advocacy-auth')

      channel.onmessage = (event: MessageEvent) => {
        if (
          !started.current ||
          event.data?.type !== 'sign-in-complete'
        ) {
          return
        }

        if (event.data.success === true) {
          void finishSignIn()
        } else if (event.data.success === false) {
          attempt.current += 1
          started.current = false
          setHasStarted(false)
          setError(
            'Sign-in was not completed. You can try again or cancel.',
          )
        }
      }
    } catch {
      // The confirmation button works without cross-tab messages.
    }

    return () => channel?.close()
  }, [finishSignIn])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="sign-in-title"
      aria-describedby="sign-in-description"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      style={{
        width: 'min(480px, calc(100vw - 40px))',
        boxSizing: 'border-box',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: 24,
        color: 'var(--text)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
      }}
    >
      <h2 id="sign-in-title">
        {savingCampaign
          ? 'Sign in to save your campaign'
          : 'Create an account or sign in'}
      </h2>

      <p id="sign-in-description">
        Google opens in a separate tab. Your current work stays here.
        {savingCampaign &&
          ' After sign-in, this campaign will be saved to your account.'}
      </p>

      <a
        className="back-button"
        style={{
          display: 'inline-block',
          textDecoration: 'none',
        }}
        href="/oauth2/authorization/google"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => {
          if (checking.current) {
            event.preventDefault()
            return
          }

          attempt.current += 1
          started.current = true
          setHasStarted(true)
          setError('')
        }}
      >
        Continue with Google
      </a>

      {hasStarted && (
        <p role="status">
          When Google finishes, close its tab and return here.
          If this message remains, select “I have signed in”.
        </p>
      )}

      {error && <p role="alert">{error}</p>}

      <div className="campaign-details-actions">
        {hasStarted && (
          <button
            type="button"
            disabled={isChecking}
            onClick={() => {
              void finishSignIn()
            }}
          >
            {isChecking ? 'Checking sign-in…' : 'I have signed in'}
          </button>
        )}

        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </dialog>
  )
}