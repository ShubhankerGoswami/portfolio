import { useState, useRef, useCallback, useEffect } from 'react'
import RecruiterVoiceAgent from './RecruiterVoiceAgent'
import PDFViewer from './PDFViewer'

const track = (name, params) =>
  typeof window.gtag === 'function' && window.gtag('event', name, { page: 'recruiter', ...params })

const RP_ORB_BG = {
  idle:       'hsla(270,80%,45%,0.22)', listening:  'hsla(142,70%,40%,0.25)',
  processing: 'hsla(210,100%,50%,0.2)', speaking:  'hsla(280,80%,50%,0.25)',
}
const RP_ORB_BORDER = {
  idle:       'hsla(270,80%,60%,0.5)', listening:  'hsl(142,70%,55%)',
  processing: 'hsl(210,100%,65%)',     speaking:   'hsl(280,80%,72%)',
}
const RP_ORB_GLOW = {
  idle:       'hsla(270,80%,55%,0.15)', listening:  'hsla(142,70%,45%,0.28)',
  processing: 'hsla(210,100%,56%,0.25)', speaking: 'hsla(270,100%,60%,0.28)',
}

// ── Extract meaningful terms from Cogni's response for PDF highlighting ──
// All lowercase — compared against lowercased span text
const STOPWORDS = new Set([
  'this','that','the','his','her','has','have','also','with','from','about',
  'when','where','which','will','would','could','should','just','very','some',
  'more','such','these','those','been','being','during','after','before','into',
  'over','through','including','across','while','although','however','therefore',
  'furthermore','moreover','specifically','particularly','essentially',
  'additionally','currently','previously','hello','welcome','cogni','please',
  'thank','sure','great','know','tell','here','there','they','them','their',
  'what','your','work','help','like','even','make','take','come','give','look',
  'want','seem','feel','need','keep','find','show','lead','well','able','each',
  'back','many','then','time','year','good','best','both','most','only','first',
  'last','long','high','real','true','main','full','hard','free','next','same',
  'said','done','area','role','team','that','uses','used','built','build',
  'strong','skills','skill','great','using','where','often','within','across',
])

function extractHighlightTerms(text) {
  // All words 4+ chars, case-insensitive — catches "python", "react", "agile" etc.
  const allWords = text.match(/\b[a-zA-Z]{4,}\b/g) ?? []
  const years    = text.match(/\b20\d{2}\b/g) ?? []

  const terms = [...new Set(allWords.map(w => w.toLowerCase()))]
    .filter(w => !STOPWORDS.has(w))
    .slice(0, 20)

  return [...terms, ...years]
}

export default function RecruiterPage() {
  const [highlightTerms, setHighlightTerms] = useState([])
  const hlTimer = useRef(null)
  const [isMobile,   setIsMobile]   = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const [sheetOpen,  setSheetOpen]  = useState(true)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const rvaRef                      = useRef(null)
  const [orbPhase,   setOrbPhase]   = useState('idle')
  const [previewMsg, setPreviewMsg] = useState('')
  const [dragHeight, setDragHeight] = useState(null)
  const dragStateRef                = useRef(null)   // { startY, startHeight }
  const wasDragRef                  = useRef(false)
  const sheetOpenRef                = useRef(sheetOpen)
  useEffect(() => { sheetOpenRef.current = sheetOpen }, [sheetOpen])

  const handleStatusChange = useCallback((phase, text) => {
    setOrbPhase(phase)
    if (text) setPreviewMsg(text)
  }, [])

  const onDragStart = useCallback((clientY) => {
    wasDragRef.current = false
    dragStateRef.current = {
      startY:      clientY,
      startHeight: sheetOpenRef.current ? window.innerHeight * 0.55 : 80,
    }
    setDragHeight(dragStateRef.current.startHeight)
  }, [])

  const onDragMove = useCallback((clientY) => {
    if (!dragStateRef.current) return
    const delta = dragStateRef.current.startY - clientY
    if (Math.abs(delta) > 6) wasDragRef.current = true
    const clamped = Math.max(80, Math.min(window.innerHeight * 0.93, dragStateRef.current.startHeight + delta))
    setDragHeight(clamped)
  }, [])

  const onDragEnd = useCallback((clientY) => {
    if (!dragStateRef.current) return
    const delta  = dragStateRef.current.startY - clientY
    const finalH = dragStateRef.current.startHeight + delta
    dragStateRef.current = null
    setDragHeight(null)
    if (!wasDragRef.current) {
      setSheetOpen(o => !o)
    } else {
      setSheetOpen(finalH > window.innerHeight * 0.28)
    }
  }, [])

  useEffect(() => { track('recruiter_page_view') }, [])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  const handleResponseText = useCallback((text) => {
    clearTimeout(hlTimer.current)
    const terms = extractHighlightTerms(text)
    setHighlightTerms(terms)
    if (terms.length) track('pdf_highlight_triggered', { term_count: terms.length })
    hlTimer.current = setTimeout(() => setHighlightTerms([]), 15000)
  }, [])
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes meshDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-20px) scale(1.08); }
        }

        .rp-root {
          height: 100vh; overflow: hidden;
          background: hsl(222,47%,5%);
          display: flex; flex-direction: column;
          font-family: Inter, sans-serif;
          position: relative;
        }

        /* Subtle background mesh blobs */
        .rp-mesh {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
        }
        .rp-mesh-b1 {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: hsla(270,80%,45%,.06); filter: blur(90px);
          top: -200px; right: -100px;
          animation: meshDrift 18s ease-in-out infinite;
        }
        .rp-mesh-b2 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: hsla(210,100%,50%,.05); filter: blur(80px);
          bottom: -150px; left: -100px;
          animation: meshDrift 22s ease-in-out infinite reverse;
        }

        /* ── Header ── */
        .rp-header {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px;
          height: 56px;
          border-bottom: 1px solid hsla(222,30%,18%,.8);
          background: hsla(222,47%,7%,.95);
          backdrop-filter: blur(12px);
          flex-shrink: 0; gap: 12px;
        }

        .rp-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        .rp-logo {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(270,100%,62%) 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Space Grotesk', sans-serif; font-weight: 800;
          font-size: .82rem; color: #fff; letter-spacing: -.5px;
          box-shadow: 0 0 14px hsla(270,100%,58%,.3);
        }

        .rp-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: .9rem;
          color: hsl(210,40%,96%); line-height: 1.2;
        }
        .rp-title {
          font-size: .67rem; color: hsl(215,20%,46%);
          font-family: Inter, sans-serif; line-height: 1.2;
        }

        /* Status badge */
        .rp-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 999px;
          background: hsla(142,65%,45%,.12);
          border: 1px solid hsla(142,65%,45%,.28);
          font-size: .67rem; color: hsl(142,65%,55%);
          font-family: Inter, sans-serif; font-weight: 500;
          white-space: nowrap;
        }
        .rp-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: hsl(142,65%,50%);
          box-shadow: 0 0 6px hsl(142,65%,50%);
        }

        /* Action buttons */
        .rp-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* Meatball menu button — mobile only */
        .rp-menu-btn {
          display: none; flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 9px;
          background: hsla(222,30%,18%,.8);
          border: 1px solid hsl(222,30%,22%);
          align-items: center; justify-content: center;
          cursor: pointer; color: hsl(215,20%,60%);
          -webkit-tap-highlight-color: transparent;
        }
        .rp-menu-btn:active { background: hsla(222,30%,24%,.8); }

        /* Dropdown */
        @keyframes rpMenuIn { from { opacity:0; transform:translateY(-6px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        .rp-menu-dd {
          position: absolute; top: 52px; right: 12px; z-index: 400;
          background: hsla(222,47%,11%,.98); backdrop-filter: blur(24px);
          border: 1px solid hsl(222,30%,20%); border-radius: 13px;
          box-shadow: 0 10px 40px rgba(0,0,0,.5);
          overflow: hidden; min-width: 210px;
          animation: rpMenuIn .15s ease-out;
        }
        .rp-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 13px 16px; font-size: .82rem;
          font-family: Inter, sans-serif; font-weight: 500;
          text-decoration: none; color: hsl(215,20%,65%);
          border-bottom: 1px solid hsla(222,30%,18%,.8);
          transition: background .15s, color .15s;
        }
        .rp-menu-item:last-child { border-bottom: none; }
        .rp-menu-item:active { background: hsla(222,30%,18%,.9); }
        .rp-menu-item--li  { color: hsl(207,90%,65%); }
        .rp-menu-item--dl  { color: hsl(210,100%,70%); }
        .rp-menu-item--back{ color: hsl(215,20%,44%); }
        .rp-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px; border: none;
          font-size: .75rem; font-weight: 600;
          font-family: Inter, sans-serif; text-decoration: none;
          cursor: pointer; transition: all .18s; white-space: nowrap;
        }
        .rp-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .rp-btn-primary { background: hsl(210,100%,56%); color: #fff; box-shadow: 0 4px 14px hsla(210,100%,50%,.3); }
        .rp-btn-ghost   { background: hsla(222,30%,18%,.8); border: 1px solid hsl(222,30%,22%); color: hsl(215,20%,56%); }
        .rp-btn-li      { background: hsla(207,90%,40%,.12); border: 1px solid hsla(207,90%,45%,.28); color: hsl(207,90%,65%); }

        /* ── Main ── */
        .rp-main {
          position: relative; z-index: 1;
          flex: 1; min-height: 0;
          display: grid;
          grid-template-columns: 45fr 55fr;
        }

        /* ── Resume panel ── */
        .rp-resume {
          overflow: auto;
          border-right: 1px solid hsla(222,30%,14%,.8);
          background: hsl(222,47%,6%);
          position: relative;
        }

        /* Glowing top edge on resume panel */
        .rp-resume::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, hsl(210,100%,56%) 50%, transparent 100%);
          opacity: .35;
          z-index: 1;
        }


        /* ── Voice panel ── */
        .rp-voice {
          overflow: hidden;
          display: flex; flex-direction: column;
          background: hsl(222,47%,6%);
          position: relative;
        }

        /* Animated left border on voice panel */
        .rp-voice::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0; width: 1px;
          background: linear-gradient(180deg,
            transparent 0%,
            hsl(270,100%,62%) 30%,
            hsl(180,100%,55%) 70%,
            transparent 100%
          );
          opacity: .25;
          z-index: 1;
        }

        /* ── Mobile bottom sheet ── */
        .rp-ms {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 200;
          height: 80px;
          border-radius: 22px 22px 0 0;
          background: hsla(222,47%,8%,0.97);
          border-top: 1px solid hsla(270,55%,42%,0.38);
          box-shadow: 0 -6px 40px hsla(270,80%,40%,0.18), 0 -1px 0 hsla(270,80%,60%,0.1);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          transition: height 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .rp-ms--open { height: 55vh; }

        /* Drag zone — full-width, tall touch target */
        .rp-ms-handle {
          cursor: ns-resize;
          padding: 12px 0 10px;
          display: flex; justify-content: center; align-items: center;
          flex-shrink: 0; min-height: 32px;
          user-select: none; touch-action: none;
          -webkit-tap-highlight-color: transparent;
        }
        .rp-ms-pill {
          width: 38px; height: 4px; border-radius: 2px;
          background: hsla(270,50%,65%,0.45);
          transition: background .2s;
        }
        .rp-ms-handle:active .rp-ms-pill { background: hsla(270,80%,70%,0.7); }

        /* Collapsed preview row */
        .rp-ms-preview {
          display: flex; align-items: center; gap: 10px;
          padding: 0 14px; height: 66px; flex-shrink: 0;
          cursor: pointer; -webkit-tap-highlight-color: transparent;
        }
        .rp-ms-orb {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s; cursor: pointer;
        }
        .rp-ms-orb:active { transform: scale(0.93); }

        /* RVA wrapper — hidden when collapsed, visible when open/dragging/desktop */
        .rp-rva-wrap { display: none; }
        .rp-ms--open     .rp-rva-wrap,
        .rp-ms--dragging .rp-rva-wrap,
        .rp-voice        .rp-rva-wrap {
          display: flex; flex-direction: column;
          flex: 1; min-height: 0; overflow: hidden;
        }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .rp-btn-label { display: none; }
        }
        @media (max-width: 768px) {
          .rp-root { height: 100vh; overflow: hidden; }
          .rp-main { grid-template-columns: 1fr !important; }
          .rp-resume {
            height: calc(100vh - 56px) !important;
            border-right: none !important;
            border-bottom: none !important;
          }
          /* Swap action row for meatball on mobile */
          .rp-actions { display: none !important; }
          .rp-badge   { display: none !important; }
          .rp-menu-btn { display: flex; }
          /* Allow brand to compress */
          .rp-brand { flex-shrink: 1; min-width: 0; overflow: hidden; }
          .rp-name  { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .rp-title { font-size: .6rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        }
      `}</style>

      <div className="rp-root">
        {/* Background mesh */}
        <div className="rp-mesh" aria-hidden="true">
          <div className="rp-mesh-b1" />
          <div className="rp-mesh-b2" />
        </div>

        {/* ── Header ── */}
        <header className="rp-header" style={{ position: 'relative' }}>

          <div className="rp-brand">
            <div className="rp-logo">SG</div>
            <div style={{ minWidth: 0 }}>
              <div className="rp-name">Shubhanker Goswami</div>
              <div className="rp-title">AI Product Manager · IIM Nagpur · 6+ Years of Experience</div>
            </div>
          </div>

          {/* Available badge — hidden on mobile via CSS */}
          <div className="rp-badge" style={{ display: 'flex' }}>
            <div className="rp-badge-dot" />
            Available for opportunities
          </div>

          {/* Actions — hidden on mobile via CSS */}
          <div className="rp-actions">
            <a href="mailto:shubhanker55@gmail.com" className="rp-btn rp-btn-ghost" title="Email" onClick={() => track('email_click')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span className="rp-btn-label">Email</span>
            </a>
            <a href="https://linkedin.com/in/shubhankergoswami" target="_blank" rel="noreferrer" className="rp-btn rp-btn-li" title="LinkedIn" onClick={() => track('linkedin_click')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span className="rp-btn-label">LinkedIn</span>
            </a>
            <a href="/img/resume.pdf" download="Shubhanker_Goswami_Resume.pdf" className="rp-btn rp-btn-primary" onClick={() => track('resume_download')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="rp-btn-label">Download CV</span>
            </a>
            <a href="/" className="rp-btn rp-btn-ghost" style={{ color: 'hsl(215,20%,44%)' }}>← Portfolio</a>
          </div>

          {/* Meatball menu — mobile only */}
          <button
            className="rp-menu-btn"
            onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="rp-menu-dd" onClick={e => e.stopPropagation()}>
              <a href="mailto:shubhanker55@gmail.com" className="rp-menu-item"
                onClick={() => { track('email_click'); setMenuOpen(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email Shubhanker
              </a>
              <a href="https://linkedin.com/in/shubhankergoswami" target="_blank" rel="noreferrer"
                className="rp-menu-item rp-menu-item--li"
                onClick={() => { track('linkedin_click'); setMenuOpen(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn Profile
              </a>
              <a href="/img/resume.pdf" download="Shubhanker_Goswami_Resume.pdf"
                className="rp-menu-item rp-menu-item--dl"
                onClick={() => { track('resume_download'); setMenuOpen(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CV
              </a>
              <a href="/" className="rp-menu-item rp-menu-item--back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Portfolio
              </a>
            </div>
          )}
        </header>

        {/* ── Main ── */}
        <main className="rp-main">

          {/* Resume PDF — PDF.js renderer with highlight support */}
          <div className="rp-resume">
            <PDFViewer src="/img/resume.pdf" highlightTerms={highlightTerms} />
          </div>

          {/* Cogni Voice Assistant — desktop: grid column | mobile: bottom sheet */}
          <div
            className={isMobile
              ? `rp-ms${sheetOpen ? ' rp-ms--open' : ''}${dragHeight !== null ? ' rp-ms--dragging' : ''}`
              : 'rp-voice'}
            style={isMobile && dragHeight !== null
              ? { height: `${dragHeight}px`, transition: 'none' }
              : undefined}
          >
            {/* Mobile drag zone — full-width strip, touch events for reliability */}
            {isMobile && (
              <div
                className="rp-ms-handle"
                onTouchStart={e => onDragStart(e.touches[0].clientY)}
                onTouchMove={e => onDragMove(e.touches[0].clientY)}
                onTouchEnd={e => onDragEnd(e.changedTouches[0].clientY)}
              >
                <div className="rp-ms-pill" />
              </div>
            )}

            {/* Collapsed preview row: hidden while dragging so RVA is visible */}
            {isMobile && !sheetOpen && dragHeight === null && (
              <div className="rp-ms-preview" onClick={() => setSheetOpen(true)}>
                {/* Phase-aware orb — tap opens sheet then triggers mic */}
                <div
                  className="rp-ms-orb"
                  style={{
                    background: RP_ORB_BG[orbPhase],
                    border: `1.5px solid ${RP_ORB_BORDER[orbPhase]}`,
                    boxShadow: `0 0 16px ${RP_ORB_GLOW[orbPhase]}`,
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    setSheetOpen(true)
                    setTimeout(() => rvaRef.current?.triggerOrb(), 420)
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke={RP_ORB_BORDER[orbPhase]} strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>

                {/* Latest message preview */}
                <span style={{
                  flex: 1, minWidth: 0, fontFamily: 'Inter, sans-serif',
                  fontSize: '0.74rem', lineHeight: 1.35,
                  color: previewMsg ? 'hsl(210,30%,78%)' : 'hsl(215,20%,40%)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {previewMsg || 'Ask Cogni anything…'}
                </span>

                {/* Expand chevron */}
                <div style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                  background: 'hsla(270,45%,16%,0.7)',
                  border: '1px solid hsla(270,50%,32%,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'hsl(270,55%,68%)', fontSize: '0.85rem',
                }}>↑</div>
              </div>
            )}

            <div className="rp-rva-wrap">
              <RecruiterVoiceAgent
                ref={rvaRef}
                onResponseText={handleResponseText}
                compact={isMobile}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>

        </main>
      </div>
    </>
  )
}
