import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ZevNavbar, ZevFooter, ZevThemeToggle } from '@malvezzidatr/zev-react'
import type { NavLink, FooterLink, FooterInfo } from '@malvezzidatr/zev-react'
import Home from './pages/Home'
import JobDetail from './pages/JobDetail'
import Dashboard from './pages/Dashboard'

const navLinks: NavLink[] = [
  { label: 'Mercado', href: '/mercado' },
]

const footerLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
]

const footerInfo: FooterInfo[] = [
  { label: 'Projeto', value: 'Hunt Jobs' },
  { label: 'Descrição', value: 'Agregador de vagas para devs júnior' },
]

function App() {
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

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mercado" element={<Dashboard />} />
          <Route path="/job/:id" element={<JobDetail />} />
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
