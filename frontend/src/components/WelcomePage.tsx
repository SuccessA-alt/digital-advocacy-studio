import ThemeSelect from './ThemeSelect'
import type { ThemePreference } from '../hooks/useTheme'
import './WelcomePage.css'

interface WelcomePageProps {
  theme: ThemePreference
  onThemeChange: (theme: ThemePreference) => void
  onStart: () => void
  onViewCampaigns: () => void
}

export default function WelcomePage({
  theme,
  onThemeChange,
  onStart,
  onViewCampaigns,
}: WelcomePageProps) {
  return (
    <div className="studio-welcome">
      <header className="welcome-header">
        <div className="welcome-header-inner">
          <p className="welcome-brand">
            Digital Advocacy <span>Studio</span>
          </p>

          <div className="welcome-controls">
          <ThemeSelect theme={theme} onThemeChange={onThemeChange} />
          <details className="welcome-menu">
            <summary aria-label="Open navigation">
              ☰
            </summary>

            <nav aria-label="Main navigation">
              <button
                type="button"
                onClick={onViewCampaigns}
              >
                Campaign history
              </button>
            </nav>
          </details>
          </div>
        </div>
      </header>

      <main className="welcome-main">
  <p className="welcome-eyebrow">
    DIGITAL ADVOCACY STUDIO
  </p>

  <h1>Turn concern into action in minutes.</h1>

  <p className="welcome-description">
    Turn an issue you care about into a structured, actionable advocacy campaign.
  </p>

  <button
    className="welcome-start"
    type="button"
    onClick={onStart}
  >
    Start here
  </button>
</main>
    </div>
  )
}