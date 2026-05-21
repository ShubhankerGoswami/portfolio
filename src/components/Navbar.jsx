import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'About',        href: '/#about' },
    { label: 'Projects',     href: '/projects' },
    { label: 'Resume',       href: '/resume' },
    { label: 'Skills',       href: '/#skills' },
    { label: 'Experience',   href: '/#experience' },
    { label: 'Education',    href: '/#education' },
    { label: 'Achievements', href: '/#achievements' },
    { label: 'Contact',      href: '/#contact' },
  ]

  const handleNav = (e, href) => {
    e.preventDefault()
    setMobileOpen(false)

    if (href.startsWith('/#')) {
      const sectionId = href.slice(2)
      if (isHome) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate('/')
        // After navigating home, scroll to section
        setTimeout(() => {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } else {
      navigate(href)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const isActive = (href) => {
    if (href === '/projects') return location.pathname === '/projects'
    if (href === '/resume') return location.pathname === '/resume'
    return false
  }

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="/" onClick={(e) => handleNav(e, '/')} className="nav-logo">SG</a>
        <div className="nav-links">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => handleNav(e, href)}
              style={isActive(href) ? {
                color: 'hsl(210,100%,56%)',
                background: 'hsla(210,100%,56%,0.08)',
              } : {}}
            >
              {label}
            </a>
          ))}
        </div>
        <a
          href="https://aiwaiter.beingcogni.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            borderRadius: '0.6rem',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 0 20px -6px rgba(249,115,22,0.5)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          className="nav-aiwaiter-btn"
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.filter = '' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          AIWaiter
        </a>
        <button
          className={`nav-toggle ${mobileOpen ? 'nav-toggle-open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(o => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div className={`nav-mobile ${mobileOpen ? 'nav-mobile-open' : ''}`}>
        {navLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            onClick={(e) => handleNav(e, href)}
            style={isActive(href) ? { color: 'hsl(210,100%,56%)' } : {}}
          >
            {label}
          </a>
        ))}
        <a
          href="https://aiwaiter.beingcogni.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            margin: '0.4rem 0 0.2rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          AIWaiter — My Product
        </a>
      </div>
    </nav>
  )
}
