import { useEffect, useRef, useState } from 'react'
import type { AuthStatus } from '../api'
import './AppHeader.css'

export type AppView = 'welcome' | 'builder' | 'history' | 'details'

interface AppHeaderProps {
  view: AppView
  hasCurrentCampaign: boolean
  account: AuthStatus | null
  accountBusy: boolean
  onNavigate: (view: AppView) => void
  onSignIn: () => void
  onSignOut: () => void
}

export default function AppHeader({
  view,
  hasCurrentCampaign,
  account,
  accountBusy,
  onNavigate,
  onSignIn,
  onSignOut,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const links: { view: AppView; label: string }[] = [
    { view: 'welcome', label: 'Home' },
  ]

  if (account?.authenticated) {
    links.push({
      view: 'history',
      label: 'My campaign history',
    })
  }

  if (hasCurrentCampaign) {
    links.push({
      view: 'details',
      label: 'Current campaign',
    })
  }

  useEffect(() => {
    if (!isMenuOpen) return

    function closeOutsideMenu(event: Event) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsMenuOpen(false)
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOutsideMenu)
    document.addEventListener('focusin', closeOutsideMenu)
    document.addEventListener('keydown', closeWithEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOutsideMenu)
      document.removeEventListener('focusin', closeOutsideMenu)
      document.removeEventListener('keydown', closeWithEscape)
    }
  }, [isMenuOpen])

  function choosePage(next: AppView) {
    setIsMenuOpen(false)
    onNavigate(next)

    if (next === view) {
      menuButtonRef.current?.focus()
    }
  }

  function chooseAccountAction(action: () => void) {
    setIsMenuOpen(false)
    menuButtonRef.current?.focus()
    action()
  }

  return (
    <header className="studio-header">
      <div className="studio-header-inner">
        <button
          className="studio-brand"
          type="button"
          aria-label="Digital Advocacy Studio home"
          onClick={() => choosePage('welcome')}
        >
          Digital Advocacy <span>Studio</span>
        </button>

        <div className="studio-menu" ref={menuRef}>
          <button
            ref={menuButtonRef}
            className="studio-menu-toggle"
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="studio-menu-links"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              {isMenuOpen
                ? <path d="M6 6l12 12M6 18L18 6" />
                : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>

          <nav
            id="studio-menu-links"
            className="studio-menu-panel"
            aria-label="Main navigation"
            hidden={!isMenuOpen}
          >
            {account?.authenticated && (
              <p
                style={{
                  padding: '4px 12px',
                  overflowWrap: 'anywhere',
                }}
              >
                Signed in as{' '}
                {account.email ?? account.name ?? 'your account'}
              </p>
            )}

            {links.map((link) => (
              <button
                key={link.view}
                className="studio-menu-link"
                type="button"
                aria-current={
                  view === link.view ? 'page' : undefined
                }
                disabled={
                  accountBusy && link.view === 'history'
                }
                onClick={() => choosePage(link.view)}
              >
                {link.label}
              </button>
            ))}

            {account?.authenticated ? (
              <button
                type="button"
                className="studio-menu-link"
                disabled={accountBusy}
                onClick={() => chooseAccountAction(onSignOut)}
              >
                Sign out
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="studio-menu-link"
                  disabled={accountBusy}
                  onClick={() => chooseAccountAction(onSignIn)}
                >
                  Create an account
                </button>

                <button
                  type="button"
                  className="studio-menu-link"
                  disabled={accountBusy}
                  onClick={() => chooseAccountAction(onSignIn)}
                >
                  Sign in
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}