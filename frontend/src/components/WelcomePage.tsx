import './WelcomePage.css'

interface WelcomePageProps {
  onStart: () => void
}

export default function WelcomePage({ onStart }: WelcomePageProps) {
  return (
    <div className="studio-welcome">
      <div className="welcome-main">
        <p className="welcome-eyebrow">DIGITAL ADVOCACY STUDIO</p>

        <h1>Turn concern into action in minutes.</h1>

        <p className="welcome-description">
          Turn an issue you care about into a structured, actionable advocacy campaign.
        </p>

        <button className="welcome-start" type="button" onClick={onStart}>
          Start here
        </button>
      </div>
    </div>
  )
}