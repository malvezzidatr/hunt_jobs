import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ZevNavbar, ZevFooter, ZevThemeToggle } from '@malvezzidatr/zev-react'
import type { NavLink, FooterLink, FooterInfo } from '@malvezzidatr/zev-react'
import Home from './pages/Home'
import JobDetail from './pages/JobDetail'

const navLinks: NavLink[] = [
  { label: 'Vagas', href: '/' },
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
  return (
    <BrowserRouter>
      <ZevNavbar
        logo="Hunt Jobs"
        links={navLinks}
        showLangToggle={false}
      />

      <div className="theme-toggle-fixed">
        <ZevThemeToggle />
      </div>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
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
    </BrowserRouter>
  )
}

export default App
