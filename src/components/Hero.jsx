import { useState, useEffect, useRef } from 'react'

const ROLES = ['AI Product Manager', 'GenAI Builder', 'Voice AI Specialist', '0→1 Product Leader']

const TICKER_ITEMS = [
  'Enterprise AI', 'Data Infrastructure', 'InsurTech', 'EdTech',
  'RAG Systems', 'Voice Agents', 'LLM Architecture', 'AI Chatbots',
]

function useTypewriter(items, typeSpeed = 75, deleteSpeed = 35, pauseMs = 2200) {
  const [text, setText] = useState(items[0])
  const [phase, setPhase] = useState('pausing')
  const idxRef  = useRef(0)
  const charRef = useRef(items[0].length)

  useEffect(() => {
    let timer
    const current = items[idxRef.current]
    if (phase === 'typing') {
      if (charRef.current < current.length) {
        timer = setTimeout(() => {
          charRef.current++
          setText(current.slice(0, charRef.current))
        }, typeSpeed)
      } else {
        timer = setTimeout(() => setPhase('deleting'), pauseMs)
      }
    } else if (phase === 'deleting') {
      if (charRef.current > 0) {
        timer = setTimeout(() => {
          charRef.current--
          setText(current.slice(0, charRef.current))
        }, deleteSpeed)
      } else {
        idxRef.current = (idxRef.current + 1) % items.length
        setPhase('typing')
      }
    } else {
      timer = setTimeout(() => setPhase('deleting'), pauseMs)
    }
    return () => clearTimeout(timer)
  }, [text, phase, items, typeSpeed, deleteSpeed, pauseMs])

  return text
}

function StatChip({ target, prefix = '', suffix }) {
  const [count, setCount] = useState(0)
  const ref     = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const steps    = 30
        const duration = 900
        let   step     = 0
        const timer = setInterval(() => {
          step++
          const eased = 1 - (1 - step / steps) ** 2
          setCount(Math.round(eased * target))
          if (step >= steps) clearInterval(timer)
        }, duration / steps)
      }
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref} className="hero-stat">{prefix}{count}{suffix}</span>
}

export default function Hero() {
  const role = useTypewriter(ROLES)

  return (
    <section className="hero">
      <div className="hero-bg-glow"></div>
      <div className="hero-blob hero-blob-1"></div>
      <div className="hero-blob hero-blob-2"></div>

      <div className="hero-content">
        <span className="hero-badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          Available for opportunities
        </span>

        <h1 className="hero-title">
          Hi, I'm <span className="text-gradient-primary">Shubhanker</span><br />
          <span className="text-gradient-accent">Goswami</span>
        </h1>

        <p className="hero-subtitle">
          {role}<span className="hero-cursor">|</span>
        </p>

        <p className="hero-description">
          <span className="text-gradient-primary">IIM alumnus</span> &amp; AI PM with <span className="text-gradient-primary">6+ years'</span> experience (4+ in PM) building <span className="text-gradient-primary">0→1 GenAI</span> and SaaS products across Enterprise AI, Data Infrastructure, Insurance, and EdTech — leading cross-functional teams of <span className="text-gradient-primary">20+</span> up to <span className="text-gradient-primary">CEO level</span>.
        </p>

        <div className="hero-stats">
          <StatChip target={4}  suffix="+ Products" />
          <StatChip target={3}  prefix="<" suffix=" Month MVPs" />
          <StatChip target={2}  suffix=" PoCs Signed" />
          <StatChip target={20} suffix="+ Team Size" />
        </div>

        <div className="hero-ticker">
          <div className="hero-ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="hero-ticker-item">{item}</span>
            ))}
          </div>
        </div>

        <p className="hero-description hero-description-sm">
          AI-native builder specializing in <span className="text-gradient-accent">RAG systems</span>, <span className="text-gradient-accent">AI agents</span>, <span className="text-gradient-accent">Voice agents</span>, and <span className="text-gradient-accent">LLM chatbots</span> — personally shipping production modules with <span className="text-gradient-accent">Claude Code</span> and <span className="text-gradient-accent">Codex</span>.
        </p>

        <div className="hero-buttons">
          <a href="#contact" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            Get in Touch
          </a>
          <a href="https://linkedin.com/in/shubhankergoswami" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect width="4" height="12" x="2" y="9"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            LinkedIn
          </a>
          <a
            href="https://aiwaiter.beingcogni.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              boxShadow: '0 0 40px -10px rgba(249,115,22,0.5)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Try AIWaiter
          </a>
          <button
            className="btn"
            style={{
              background: 'linear-gradient(135deg, hsl(270,100%,58%) 0%, hsl(210,100%,56%) 100%)',
              color: '#fff',
              boxShadow: '0 0 40px -10px hsla(270,100%,58%,0.45)',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => window.dispatchEvent(new CustomEvent('openChatbot'))}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask Cogni
          </button>
        </div>

        <div className="hero-contact-info">
          <a href="tel:+918527534288">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            +91 852 753 4288
          </a>
          <a href="mailto:shubhanker55@gmail.com">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            shubhanker55@gmail.com
          </a>
        </div>
      </div>

      <div className="scroll-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7"></path>
        </svg>
      </div>
    </section>
  )
}
