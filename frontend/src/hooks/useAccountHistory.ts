// This handles account checks, private history and clearing old account data.

import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, getAuthStatus, getCampaigns } from '../api'
import type { AuthStatus } from '../api'
import type { Campaign } from '../types'

interface AccountHistoryOptions {
  onAccountChanged: () => void
  canRefresh: () => boolean
  isHistoryVisible: () => boolean
}

export function useAccountHistory({
  onAccountChanged,
  canRefresh,
  isHistoryVisible,
}: AccountHistoryOptions) {
  const [account, setAccount] = useState<AuthStatus | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [checking, setChecking] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [error, setError] = useState('')

  const currentAccount = useRef<AuthStatus | null>(null)
  const accountRequest = useRef(0)
  const historyRequest = useRef(0)

  const cancelHistory = useCallback(() => {
    historyRequest.current += 1
    setLoadingHistory(false)
  }, [])

  const pauseAccountChecks = useCallback(() => {
    accountRequest.current += 1
    setChecking(false)
  }, [])

  const getAccount = useCallback(() => currentAccount.current, [])

  const applyAccount = useCallback((next: AuthStatus) => {
    if (currentAccount.current?.accountId !== next.accountId) {
      cancelHistory()
      setCampaigns([])
      setHistoryError('')
      onAccountChanged()
    }

    currentAccount.current = next
    setAccount(next)
  }, [cancelHistory, onAccountChanged])

  const loadHistory = useCallback(async (
    expected: AuthStatus | null = currentAccount.current,
  ) => {
    if (!expected?.authenticated || expected.accountId === null) return

    const requestId = ++historyRequest.current
    setLoadingHistory(true)
    setHistoryError('')

    try {
      const saved = await getCampaigns()
      const latest = await getAuthStatus()

      if (requestId !== historyRequest.current) return

      if (latest.accountId !== expected.accountId) {
        applyAccount(latest)
        setHistoryError('Your account changed. Select Refresh history.')
        return
      }

      setCampaigns(saved)
    } catch (reason: unknown) {
      if (requestId !== historyRequest.current) return

      if (reason instanceof ApiError && reason.status === 401) {
        applyAccount({
          authenticated: false,
          accountId: null,
          name: null,
          email: null,
        })
      }

      setHistoryError(reason instanceof ApiError
        ? reason.message : 'Could not load your campaign history.')
    } finally {
      if (requestId === historyRequest.current) {
        setLoadingHistory(false)
      }
    }
  }, [applyAccount])

  const refreshAccount = useCallback(async () => {
    if (!canRefresh()) return

    const requestId = ++accountRequest.current

    try {
      const next = await getAuthStatus()

      if (requestId !== accountRequest.current) return

      applyAccount(next)

      if (isHistoryVisible()) {
        void loadHistory(next)
      }
    } catch (reason: unknown) {
      if (requestId === accountRequest.current) {
        setError(reason instanceof ApiError
          ? reason.message : 'Could not check sign-in. Please try again.')
      }
    } finally {
      if (requestId === accountRequest.current) {
        setChecking(false)
      }
    }
  }, [applyAccount, canRefresh, isHistoryVisible, loadHistory])

  useEffect(() => {
    let cancelled = false
    const initialRequest = ++accountRequest.current

    void getAuthStatus().then((next) => {
      if (!cancelled && initialRequest === accountRequest.current) {
        applyAccount(next)
      }
    }).catch((reason: unknown) => {
      if (!cancelled && initialRequest === accountRequest.current) {
        setError(reason instanceof ApiError
          ? reason.message : 'Could not check sign-in. Please try again.')
      }
    }).finally(() => {
      if (!cancelled && initialRequest === accountRequest.current) {
        setChecking(false)
      }
    })

    const onFocus = () => {
      if (!canRefresh()) return
      setChecking(true)
      void refreshAccount()
    }

    window.addEventListener('focus', onFocus)

    let channel: BroadcastChannel | undefined

    try {
      channel = new BroadcastChannel('digital-advocacy-auth')
      channel.onmessage = (event: MessageEvent) => {
        if (event.data?.type === 'session-changed') {
          onFocus()
        }
      }
    } catch {
      // Returning to this tab also checks the session.
    }

    return () => {
      cancelled = true
      accountRequest.current += 1
      historyRequest.current += 1
      window.removeEventListener('focus', onFocus)
      channel?.close()
    }
  }, [applyAccount, canRefresh, refreshAccount])

  const recordCampaign = useCallback((
    campaign: Campaign,
    created = false,
  ) => {
    setCampaigns((previous) => created
      ? [campaign, ...previous.filter((item) => item.id !== campaign.id)]
      : previous.map((item) => item.id === campaign.id ? campaign : item))
  }, [])

  function checkAgain() {
    setError('')
    void refreshAccount()
  }

  return {
    account,
    campaigns,
    checking,
    loadingHistory,
    historyError,
    error,
    setError,
    applyAccount,
    getAccount,
    loadHistory,
    refreshAccount,
    pauseAccountChecks,
    cancelHistory,
    recordCampaign,
    checkAgain,
  }
}