// This coordinates saving, sign-in, sign-out and the current campaign.

import { useCallback, useRef, useState } from 'react'
import { ApiError, createCampaign, signOut } from '../api'
import type { AuthStatus } from '../api'
import type { AppView } from '../components/AppHeader'
import type { Campaign } from '../types'
import { useAccountHistory } from './useAccountHistory'
import { useSdgs } from './useSdgs'

type SignInIntent =
  | { kind: 'save'; campaign: Campaign }
  | { kind: 'account' | 'history' }

const GUEST: AuthStatus = {
  authenticated: false,
  accountId: null,
  name: null,
  email: null,
}

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof ApiError ? reason.message : fallback
}

export function useStudio() {
  const [view, setView] = useState<AppView>('welcome')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [intent, setIntent] = useState<SignInIntent | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState('')

  const mainRef = useRef<HTMLElement>(null)
  const viewRef = useRef<AppView>('welcome')
  const selectedRef = useRef<Campaign | null>(null)
  const intentRef = useRef<SignInIntent | null>(null)
  const operation = useRef(false)
  const sdgData = useSdgs()

  const changeView = useCallback((next: AppView) => {
    viewRef.current = next
    setView(next)
  }, [])

  const selectCampaign = useCallback((campaign: Campaign | null) => {
    selectedRef.current = campaign
    setSelectedCampaign(campaign)
  }, [])

  const clearPrivateWorkspace = useCallback(() => {
    if (selectedRef.current?.id == null) return

    selectCampaign(null)

    if (viewRef.current === 'details') {
      changeView('history')
    }
  }, [changeView, selectCampaign])

  const canRefresh = useCallback(
    () => !operation.current && !intentRef.current,
    [],
  )

  const isHistoryVisible = useCallback(
    () => viewRef.current === 'history',
    [],
  )

  const accountData = useAccountHistory({
    onAccountChanged: clearPrivateWorkspace,
    canRefresh,
    isHistoryVisible,
  })

  const {
    applyAccount,
    getAccount,
    pauseAccountChecks,
    cancelHistory,
    recordCampaign,
    loadHistory,
    refreshAccount,
    setError,
  } = accountData

  const beginSignIn = useCallback((next: SignInIntent) => {
    if (operation.current || intentRef.current) return

    pauseAccountChecks()
    setError('')
    intentRef.current = next
    setIntent(next)
  }, [pauseAccountChecks, setError])

  const saveDraft = useCallback(async (
    draft: Campaign,
    account: AuthStatus,
  ) => {
    if (operation.current || draft.id !== null) return

    if (!account.authenticated || account.accountId === null) {
      beginSignIn({ kind: 'save', campaign: draft })
      return
    }

    operation.current = true
    pauseAccountChecks()
    cancelHistory()
    setBusy('Saving campaign…')
    setError('')
    setMessage('')

    try {
      const saved = await createCampaign({
        title: draft.title,
        problem: draft.problem,
        sdgId: draft.sdg?.id ?? null,
        desiredOutcome: draft.desiredOutcome,
        coreMessage: draft.coreMessage,
        sharingMethod: draft.sharingMethod,
        decisionMaker: draft.decisionMaker,
        advocacyPlan: draft.advocacyPlan,
        successMeasures: draft.successMeasures,
      })

      const current = { ...saved, draftKey: draft.draftKey }

      selectCampaign(current)
      recordCampaign(current, true)
      changeView('details')
      setMessage('Your campaign has been saved to your account.')
      mainRef.current?.focus({ preventScroll: true })
    } catch (reason: unknown) {
      if (reason instanceof ApiError && reason.status === 401) {
        applyAccount(GUEST)
        operation.current = false
        beginSignIn({ kind: 'save', campaign: draft })
      } else {
        setError(errorMessage(
          reason,
          'The save could not be confirmed. Check My campaign history before trying again. Your draft is still here.',
        ))
      }
    } finally {
      operation.current = false
      setBusy('')
    }
  }, [
    applyAccount,
    beginSignIn,
    cancelHistory,
    changeView,
    pauseAccountChecks,
    recordCampaign,
    selectCampaign,
    setError,
  ])

  const finishSignIn = useCallback((account: AuthStatus) => {
    const pending = intentRef.current
    if (!pending) return

    intentRef.current = null
    setIntent(null)
    applyAccount(account)

    if (pending.kind === 'save') {
      void saveDraft(pending.campaign, account)
    } else {
      setMessage('You are signed in.')

      if (pending.kind === 'history') {
        changeView('history')
        void loadHistory(account)
      }
    }
  }, [applyAccount, changeView, loadHistory, saveDraft])

  function cancelSignIn() {
    intentRef.current = null
    setIntent(null)
    setMessage('Cancelled. Your current work is still here.')
    void refreshAccount()
  }

  function navigate(next: AppView) {
    if (operation.current || intentRef.current) return

    setMessage('')
    setError('')

    if (next === 'history') {
      const account = getAccount()

      if (!account?.authenticated) {
        beginSignIn({ kind: 'history' })
        return
      }

      void loadHistory(account)
    }

    changeView(next)
  }

  async function handleSignOut() {
    if (operation.current) return

    operation.current = true
    pauseAccountChecks()
    cancelHistory()
    setBusy('Signing out…')
    setError('')

    try {
      await signOut()
      applyAccount(GUEST)
      changeView('welcome')
      setMessage('You are signed out.')

      try {
        const channel = new BroadcastChannel('digital-advocacy-auth')
        channel.postMessage({ type: 'session-changed' })
        channel.close()
      } catch {
        // Other tabs also check their session on focus.
      }
    } catch (reason: unknown) {
      setError(errorMessage(
        reason,
        'Could not confirm sign-out. Please try again.',
      ))
    } finally {
      operation.current = false
      setBusy('')
    }
  }

  function handleCampaignCreated(campaign: Campaign) {
    selectCampaign({
      ...campaign,
      draftKey: campaign.draftKey ?? crypto.randomUUID(),
    })

    changeView('details')
    setMessage('Your campaign is ready. It has not been saved.')
  }

  function handleCampaignUpdated(campaign: Campaign) {
    if (
      campaign.id !== null &&
      (
        accountData.account?.accountId !== getAccount()?.accountId ||
        selectedRef.current?.id !== campaign.id
      )
    ) {
      return
    }

    const updated = {
      ...campaign,
      draftKey: selectedRef.current?.draftKey ?? campaign.draftKey,
    }

    if (campaign.id !== null) {
      recordCampaign(updated)
    }

    selectCampaign(updated)
    changeView('details')

    setMessage(campaign.id === null
      ? 'Your draft has been updated. It has not been saved.'
      : 'Your changes were saved as a new version.')
  }

  function openCampaign(campaign: Campaign) {
    if (selectedRef.current?.id !== campaign.id) {
      selectCampaign(campaign)
    }

    navigate('details')
  }

  function saveCurrentCampaign() {
    const draft = selectedRef.current
    if (!draft || draft.id !== null) return

    const account = getAccount()

    if (account?.authenticated) {
      void saveDraft(draft, account)
    } else {
      beginSignIn({ kind: 'save', campaign: draft })
    }
  }

  return {
    view,
    mainRef,
    selectedCampaign,
    intent,
    message,
    busy,
    sdgData,
    accountData,
    navigate,
    beginSignIn,
    finishSignIn,
    cancelSignIn,
    handleSignOut,
    handleCampaignCreated,
    handleCampaignUpdated,
    openCampaign,
    saveCurrentCampaign,
  }
}

export type Studio = ReturnType<typeof useStudio>