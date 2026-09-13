import { useLayoutEffect, useState } from 'react'

export type ThemePreference = 'light' | 'dark'

const storageKey = 'advocacy-studio-theme'

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Switching still works when browser storage is unavailable.
  }

  // Use the device preference on the first visit, then remember the choice.
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemePreference>(readPreference)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // The choice remains active for this session even without storage.
    }
  }, [theme])

  return { theme, setTheme }
}
