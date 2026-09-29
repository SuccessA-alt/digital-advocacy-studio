// This handles loading the SDG options.

import { useEffect, useState } from 'react'
import { ApiError, getSdgs } from '../api'
import type { Sdg } from '../types'

export function useSdgs() {
  const [sdgs, setSdgs] = useState<Sdg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    void getSdgs().then((items) => {
      if (!cancelled) setSdgs(items)
    }).catch((reason: unknown) => {
      if (!cancelled) {
        setError(reason instanceof ApiError
          ? reason.message : 'Could not load the campaign studio.')
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [])

  return { sdgs, loading, error }
}