// This now only assembles the app and manages page focus.

import { useEffect, useRef } from 'react'
import AppHeader from './components/AppHeader'
import SignInDialog from './components/SignInDialog'
import StudioScreens from './components/StudioScreens'
import ThemeSelect from './components/ThemeSelect'
import { useStudio } from './hooks/useStudio'
import { useTheme } from './hooks/useTheme'
import './App.css'

export default function App() {
  const { theme, setTheme } = useTheme()
  const studio = useStudio()
  const { view, mainRef, busy, message, intent, accountData } = studio
  const previousView = useRef(view)
  const blocked = busy !== ''

  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [mainRef, view])

  return (
    <div className="app">
      <div inert={blocked}>
        <AppHeader
          view={view}
          hasCurrentCampaign={studio.selectedCampaign !== null}
          account={accountData.account}
          accountBusy={accountData.checking || blocked}
          onNavigate={studio.navigate}
          onSignIn={() => studio.beginSignIn({ kind: 'account' })}
          onSignOut={() => { void studio.handleSignOut() }}
        />
        <ThemeSelect theme={theme} onThemeChange={setTheme} />
      </div>

      <div style={{
        width: 'min(calc(100% - 40px), 900px)',
        margin: '16px auto',
      }}>
        {(busy || message) && (
          <div className="success-message" role="status">{busy || message}</div>
        )}
        {accountData.error && (
          <div className="error-summary" role="alert">
            <p>{accountData.error}</p>
            <button type="button" disabled={blocked} onClick={accountData.checkAgain}>
              Check account again
            </button>
          </div>
        )}
      </div>

      <main
        id="studio-main"
        ref={mainRef}
        tabIndex={-1}
        inert={blocked}
        className={view === 'welcome' ? 'studio-home-content' : 'main-content'}
      >
        <StudioScreens studio={studio} />
      </main>

      {intent && (
        <SignInDialog
          savingCampaign={intent.kind === 'save'}
          onSignedIn={studio.finishSignIn}
          onCancel={studio.cancelSignIn}
        />
      )}
    </div>
  )
}