import { useEffect, useMemo, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ZevNavbar, ZevFooter, ZevThemeToggle } from '@malvezzidatr/zev-react'
import type { NavLink, FooterLink, FooterInfo } from '@malvezzidatr/zev-react'
import { useAuth } from './features/auth'
import type { User } from './features/auth'
import Home from './pages/Home'
import JobDetail from './pages/JobDetail'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Tracker from './pages/Tracker'

const footerLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]

const footerInfo: FooterInfo[] = [
  { label: 'Projeto', value: 'Hunt Jobs' },
  { label: 'Descrição', value: 'Agregador de vagas para devs júnior' },
]

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="user-menu-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || ''}
            className="user-menu-avatar"
            onError={(e) => {
              (e.currentTarget).style.display = 'none'
              const fallback = e.currentTarget.nextElementSibling
              if (fallback) (fallback as HTMLElement).style.display = 'flex'
            }}
          />
        ) : null}
        <span
          className="user-menu-avatar-fallback"
          style={{ display: user.avatar ? 'none' : 'flex' }}
        >
          {(user.name || user.email)[0].toUpperCase()}
        </span>
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-dropdown-info">
            <span className="user-menu-dropdown-name">{user.name || user.email}</span>
            <span className="user-menu-dropdown-email">{user.email}</span>
          </div>
          <hr className="user-menu-dropdown-divider" />
          <button
            className="user-menu-dropdown-logout"
            onClick={() => {
              onLogout()
              setOpen(false)
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}

function App() {
  const { isAuthenticated, isLoading, user, logout } = useAuth()

  const navLinks = useMemo<NavLink[]>(() => {
    const links: NavLink[] = [{ label: 'Mercado', href: '/mercado' }]
    if (isAuthenticated && !isLoading) {
      links.push({ label: 'Tracker', href: '/tracker' })
    }
    if (!isAuthenticated && !isLoading) {
      links.push({ label: 'Entrar', href: '/login' })
    }
    return links
  }, [isAuthenticated, isLoading])

  useEffect(() => {
    const handler = (e: Event) => {
      const theme = (e as CustomEvent<{ theme: string }>).detail?.theme
      if (theme) localStorage.setItem('huntjobs_theme', theme)
    }
    document.addEventListener('theme-change', handler)
    return () => document.removeEventListener('theme-change', handler)
  }, [])

  return (
    <BrowserRouter>
      <ZevNavbar
        logo="Hunt Jobs"
        logoHref="/"
        links={navLinks}
        showLangToggle={false}
      />

      <div className="theme-toggle-fixed">
        <ZevThemeToggle />
      </div>

      {isAuthenticated && user && (
        <UserMenu user={user} onLogout={logout} />
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mercado" element={<Dashboard />} />
          <Route path="/job/:id" element={<JobDetail />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>

      <ZevFooter
        heading="Hunt Jobs"
        info={footerInfo}
        links={footerLinks}
        decorativeName="HJ"
        copyright="2025 Hunt Jobs"
      />

      <Analytics />
    </BrowserRouter>
  )
}

export default App
