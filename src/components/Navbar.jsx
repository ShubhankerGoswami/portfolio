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
      </div>
    </nav>
  )
}
