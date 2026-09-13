import type { ThemePreference } from '../hooks/useTheme'

interface ThemeSelectProps {
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
}

export default function ThemeSelect({ theme, onThemeChange }: ThemeSelectProps) {
  const isDark = theme === 'dark'

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
          </>
        ) : (
          <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z" />
        )}
      </svg>
    </button>
  )
}
