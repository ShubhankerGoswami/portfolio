import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import OrbShader    from './OrbShader'
import AuroraCanvas from './AuroraCanvas'

const track = (name, params) =>
  typeof window.gtag === 'function' && window.gtag('event', name, { page: 'recruiter', ...params })

const VOICE_WS_BASE =
  window.location.host.split(':')[0] === 'localhost'
    ? 'ws://localhost:10000/ws/voice'
    : 'wss://portfoliobackend-q666.onrender.com/ws/voice'

const SESSION_KEY   = 'rva_session_id'
const MAX_RECONNECT = 5
const BASE_DELAY_MS = 1000
const JD_MAX_CHARS  = 4000

function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, id) }
  return id
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const MicIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const StopIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

const DocIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

// ── URL renderer ──────────────────────────────────────────────────────────────
const URL_RE = /(https?:\/\/[^\s]+)/g
function BotText({ text }) {
  return (
    <>
      {text.split(URL_RE).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noreferrer" onClick={() => track('cogni_booking_link_opened')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 8, padding: '7px 18px',
            background: 'linear-gradient(135deg, hsl(270,100%,58%) 0%, hsl(210,100%,56%) 100%)',
            color: '#fff', borderRadius: 10, fontSize: '0.8rem',
            fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em',
          }}>
            📅 Book Meeting
          </a>
        ) : <span key={i}>{part}</span>
      )}
    </>
  )
}

// ── Scorecard parser + components ────────────────────────────────────────────
// Match from %%SCORECARD%% to %%END_SCORECARD%% OR end of string
const SCORECARD_RE = /%%SCORECARD%%([\s\S]*?)(?:%%END_SCORECARD%%|$)/

const FIXED_KEYS = [
  'overall_match', 'skills_match', 'domain_match', 'leadership_score',
  'experience_years', 'domain_alignment', 'top_matched_skills', 'key_strength', 'gap',
]

function parseScorecard(text) {
  if (!text) return null
  const match = text.match(SCORECARD_RE)
  if (!match) return null
  const content = match[1].trim()
  if (!content) return null

  const data = {}

  // Strategy 1: newline-separated (ideal)
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length >= 3) {
    lines.forEach(line => {
      const colon = line.indexOf(':')
      if (colon > 0) {
        data[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
      }
    })
    if (Object.keys(data).length >= 3) return data
  }

  // Strategy 2: space-separated fallback — LLM put all fields on one line
  // Build key list: fixed keys + any match_N keys found in content
  const matchKeys = [...content.matchAll(/\bmatch_(\d+):/g)]
    .map(m => `match_${m[1]}`).sort()
  const allKeys = [...FIXED_KEYS, ...matchKeys]

  allKeys.forEach((key, i) => {
    const ki = content.indexOf(key + ':')
    if (ki === -1) return
    let valEnd = content.length
    for (let j = i + 1; j < allKeys.length; j++) {
      const nk = content.indexOf(allKeys[j] + ':', ki + key.length + 1)
      if (nk !== -1 && nk < valEnd) valEnd = nk
    }
    const val = content.slice(ki + key.length + 1, valEnd).trim()
    if (val) data[key] = val
  })

  return Object.keys(data).length > 0 ? data : null
}

const SUGGESTIONS_RE = /%%SUGGESTIONS%%([\s\S]*?)(?:%%END_SUGGESTIONS%%|$)/

function parseSuggestions(text) {
  if (!text) return []
  const match = text.match(SUGGESTIONS_RE)
  if (!match) return []
  return match[1].trim().split(/\r?\n/)
    .map(l => l.trim().replace(/^\[|\]$/g, '').trim())
    .filter(Boolean)
}

// Strip all %%BLOCK%%…%%END_BLOCK%% sections (scorecard, suggestions, any future block)
function stripBlocks(text) {
  return text.replace(/%%\w+%%[\s\S]*/g, '').trim()
}

function MetricCircle({ label, value, size = 64 }) {
  const r = size * 0.38
  const circumference = 2 * Math.PI * r
  const pct = Math.min(Math.max(parseInt(value) || 0, 0), 100)
  const dash = (pct / 100) * circumference
  const color = pct >= 80 ? 'hsl(142,70%,52%)' : pct >= 60 ? 'hsl(38,100%,55%)' : 'hsl(0,65%,55%)'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(222,30%,16%)" strokeWidth="4.5" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4.5"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
          fontSize: size >= 64 ? '0.88rem' : '0.72rem', color,
        }}>
          {pct}%
        </div>
      </div>
      <div style={{ fontSize: '0.58rem', color: 'hsl(215,20%,44%)', fontFamily: 'Inter, sans-serif', textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  )
}

function MatchRow({ req, evidence, isLast }) {
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'flex-start',
      padding: '6px 0',
      borderBottom: isLast ? 'none' : '1px solid hsla(270,45%,16%,.5)',
    }}>
      <span style={{ fontSize: '0.7rem', flexShrink: 0, marginTop: '1px', lineHeight: 1 }}>✅</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 600, color: 'hsl(210,40%,92%)',
          fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.3,
        }}>{req}</div>
        <div style={{
          fontSize: '0.66rem', color: 'hsl(215,20%,54%)',
          fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginTop: 1,
        }}>{evidence}</div>
      </div>
    </div>
  )
}

function JDScorecard({ data }) {
  const skills = (data.top_matched_skills || '').split(',').map(s => s.trim()).filter(Boolean)
  const hasGap = data.gap && data.gap.toLowerCase() !== 'none' && data.gap.trim()

  // Extract match_N items sorted by index
  const matches = Object.entries(data)
    .filter(([k]) => /^match_\d+$/.test(k))
    .sort(([a], [b]) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]))
    .map(([, v]) => {
      const pipe = v.indexOf(' | ')
      return pipe > 0
        ? { req: v.slice(0, pipe).trim(), evidence: v.slice(pipe + 3).trim() }
        : { req: v.trim(), evidence: '' }
    })

  return (
    <div style={{
      background: 'linear-gradient(160deg, hsla(265,55%,9%,.99) 0%, hsla(210,55%,7%,.96) 100%)',
      border: '1px solid hsla(270,45%,24%,.6)',
      borderRadius: 13,
      padding: '13px 13px 11px',
      marginBottom: 8,
      boxShadow: '0 8px 32px hsla(270,80%,20%,.3)',
      animation: 'scIn .3s ease-out',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: '0.82rem' }}>📊</span>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '0.74rem', color: 'hsl(210,40%,94%)', letterSpacing: '0.01em' }}>
          JD Fit Scorecard
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, hsla(270,45%,30%,.6), transparent)', marginLeft: 4 }} />
      </div>

      {/* ── 3 Metric Circles ── */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
        <MetricCircle label="Overall Match" value={data.overall_match} />
        <MetricCircle label="Skills Match" value={data.skills_match} />
        <MetricCircle label="Domain Fit" value={data.domain_match} />
      </div>

      {/* ── Info row: Experience + Domain ── */}
      {(data.experience_years || data.domain_alignment) && (
        <>
          <div style={{ height: 1, background: 'hsla(270,45%,18%,.6)', margin: '4px 0 8px' }} />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {data.experience_years && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.67rem', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: 'hsl(215,20%,38%)' }}>Experience</span>
                <span style={{ color: 'hsl(210,100%,72%)', fontWeight: 600 }}>{data.experience_years}</span>
              </div>
            )}
            {data.domain_alignment && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.67rem', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: 'hsl(215,20%,38%)' }}>Domain</span>
                <span style={{ color: 'hsl(142,65%,58%)', fontWeight: 600 }}>{data.domain_alignment}</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── JD Requirements vs Profile ── */}
      {matches.length > 0 && (
        <>
          <div style={{ height: 1, background: 'hsla(270,45%,18%,.6)', margin: '10px 0 8px' }} />
          <div style={{
            fontSize: '0.57rem', color: 'hsl(270,40%,52%)',
            fontFamily: 'Inter, sans-serif', marginBottom: 6,
            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
          }}>
            JD Requirements vs. Profile
          </div>
          <div style={{
            background: 'hsla(222,47%,6%,.7)',
            border: '1px solid hsla(270,45%,18%,.5)',
            borderRadius: 8, padding: '2px 10px',
          }}>
            {matches.map((m, i) => (
              <MatchRow key={i} req={m.req} evidence={m.evidence} isLast={i === matches.length - 1} />
            ))}
          </div>
        </>
      )}

      {/* ── Matched Skills ── */}
      {skills.length > 0 && (
        <>
          <div style={{ height: 1, background: 'hsla(270,45%,18%,.6)', margin: '10px 0 8px' }} />
          <div style={{ fontSize: '0.57rem', color: 'hsl(215,20%,36%)', fontFamily: 'Inter, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Matched Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {skills.map((s, i) => (
              <span key={i} style={{
                padding: '3px 8px', borderRadius: 999,
                background: 'hsla(210,100%,56%,.09)',
                border: '1px solid hsla(210,100%,56%,.25)',
                color: 'hsl(210,100%,68%)',
                fontSize: '0.62rem', fontFamily: 'Inter, sans-serif', fontWeight: 500,
              }}>{s}</span>
            ))}
          </div>
        </>
      )}

      {/* ── Key Strength ── */}
      {data.key_strength && (
        <>
          <div style={{ height: 1, background: 'hsla(270,45%,18%,.6)', margin: '10px 0 8px' }} />
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 7,
            padding: '7px 10px',
            background: 'hsla(48,100%,50%,.05)',
            border: '1px solid hsla(48,100%,50%,.14)',
            borderRadius: 8,
          }}>
            <span style={{ fontSize: '0.7rem', flexShrink: 0 }}>⭐</span>
            <span style={{ fontSize: '0.68rem', color: 'hsl(48,100%,74%)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              {data.key_strength}
            </span>
          </div>
        </>
      )}

      {/* ── Gap ── */}
      {hasGap && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 7,
          marginTop: 8, padding: '6px 10px',
          background: 'hsla(38,100%,50%,.05)',
          border: '1px solid hsla(38,100%,50%,.16)',
          borderRadius: 8,
        }}>
          <span style={{ fontSize: '0.7rem', flexShrink: 0 }}>⚠️</span>
          <span style={{ fontSize: '0.68rem', color: 'hsl(38,100%,66%)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
            {data.gap}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Processing steps ─────────────────────────────────────────────────────────
const JD_STEPS = [
  { label: 'Reading job description',          delay: 0    },
  { label: 'Matching requirements to profile', delay: 1600 },
  { label: 'Scoring fit across dimensions',    delay: 3200 },
  { label: 'Building scorecard',               delay: 4800 },
  { label: 'Formulating response',             delay: 6200 },
]
const QUERY_STEPS = [
  { label: 'Understanding your question', delay: 0    },
  { label: 'Searching knowledge base',   delay: 1200 },
  { label: 'Formulating response',       delay: 2500 },
]

function ProcessingSteps({ isJD }) {
  const steps = isJD ? JD_STEPS : QUERY_STEPS
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
    const timers = steps
      .slice(1)
      .map((s, i) => setTimeout(() => setIdx(i + 1), s.delay))
    return () => timers.forEach(clearTimeout)
  }, [isJD])

  return (
    <div style={{
      background: 'linear-gradient(135deg, hsla(265,55%,11%,.9) 0%, hsla(185,55%,9%,.7) 100%)',
      border: '1px solid hsla(270,45%,22%,.45)',
      borderRadius: '13px 13px 13px 4px',
      padding: '10px 13px 12px',
    }}>
      <span style={{
        display: 'block', fontSize: '0.6rem', color: 'hsl(270,40%,56%)',
        marginBottom: 9, textTransform: 'uppercase', letterSpacing: '.07em',
        fontFamily: 'Inter, sans-serif',
      }}>Cogni</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {steps.map((step, i) => {
          const done   = i < idx
          const active = i === idx
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              opacity: i > idx ? 0.2 : 1,
              transition: 'opacity 0.5s ease',
            }}>
              {/* Status dot */}
              <div style={{
                width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background:   done   ? 'hsl(142,65%,44%)' : 'transparent',
                border:       done   ? 'none'
                            : active ? '1.5px solid hsl(270,80%,62%)'
                                     : '1.5px solid hsla(222,30%,30%,.5)',
                transition: 'all 0.4s ease',
              }}>
                {done && (
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <polyline points="1.5,5 4,7.5 8.5,2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {active && (
                  <span style={{
                    display: 'block', width: 6, height: 6, borderRadius: '50%',
                    background: 'hsl(270,80%,66%)',
                    animation: 'connBlink 1s ease-in-out infinite',
                  }}/>
                )}
              </div>
              {/* Label */}
              <span style={{
                fontSize: '0.72rem',
                fontFamily: 'Inter, sans-serif',
                color: done   ? 'hsl(215,20%,42%)'
                     : active ? 'hsl(210,40%,93%)'
                              : 'hsl(215,20%,30%)',
                fontWeight: active ? 500 : 400,
                transition: 'color 0.4s ease',
              }}>
                {step.label}
                {active && (
                  <span style={{
                    marginLeft: 3, opacity: 0.55,
                    animation: 'connBlink 1.4s ease-in-out infinite',
                  }}>…</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Waveform bars ─────────────────────────────────────────────────────────────
const WAVE_HEIGHTS = [6, 14, 20, 16, 10, 18, 24, 14, 20, 12, 18, 8, 16, 22, 12, 8]
function Waveform({ active, phase }) {
  const baseColor =
    phase === 'listening'  ? 'hsl(142,70%,55%)' :
    phase === 'processing' ? 'hsl(210,100%,65%)' :
    phase === 'speaking'   ? 'hsl(280,80%,70%)'  : 'hsl(215,20%,40%)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 32 }}>
      {WAVE_HEIGHTS.map((h, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: baseColor,
          opacity: active ? 0.85 : 0.2,
          height: active ? h : 4,
          animation: active ? `waveBar ${0.55 + (i % 4) * 0.12}s ease-in-out infinite alternate` : 'none',
          animationDelay: `${(i * 0.07) % 0.5}s`,
          transition: 'height 0.3s ease, opacity 0.3s ease',
        }} />
      ))}
    </div>
  )
}

// ── Quick suggestion chips ────────────────────────────────────────────────────
const SUGGESTIONS = [
  'What makes him stand out?',
  'Tell me about his AI work',
  'Key achievements?',
  'What teams has he led?',
]

// ── Phase / conn maps ─────────────────────────────────────────────────────────
const PHASE = {
  idle:       { label: 'Tap the orb to speak',  color: 'hsl(215,20%,52%)',   glow: 'hsla(270,80%,55%,0.25)' },
  listening:  { label: 'Listening…',            color: 'hsl(142,70%,55%)',   glow: 'hsla(142,70%,45%,0.35)' },
  processing: { label: 'Thinking…',             color: 'hsl(210,100%,65%)',  glow: 'hsla(210,100%,56%,0.35)' },
  speaking:   { label: 'Speaking…',             color: 'hsl(280,80%,72%)',   glow: 'hsla(270,100%,60%,0.4)'  },
}

const CONN = {
  disconnected: { label: 'Offline',        color: 'hsl(0,65%,58%)',    pulse: false },
  connecting:   { label: 'Connecting…',    color: 'hsl(38,100%,58%)',  pulse: true  },
  connected:    { label: 'Live',           color: 'hsl(142,65%,48%)',  pulse: false },
  reconnecting: { label: 'Reconnecting…', color: 'hsl(38,100%,58%)',  pulse: true  },
}

// ── Component ─────────────────────────────────────────────────────────────────
const RecruiterVoiceAgent = forwardRef(function RecruiterVoiceAgent({ onResponseText, compact = false, onStatusChange }, ref) {
  const [phase,           setPhase]           = useState('idle')
  const [connState,       setConnState]       = useState('disconnected')
  const [messages,        setMessages]        = useState([])
  const [errMsg,          setErrMsg]          = useState('')
  const [jdText,          setJdText]          = useState('')
  const [jdOpen,          setJdOpen]          = useState(false)
  const [jdSubmitting,    setJdSubmitting]    = useState(false)
  const [greetingPending, setGreetingPending] = useState(false)

  const socketRef             = useRef(null)
  const mediaRecorderRef      = useRef(null)
  const audioChunksRef        = useRef([])
  const currentAudioRef       = useRef(null)
  const audioQueueRef         = useRef([])      // sentence-level audio queue
  const isPlayingRef          = useRef(false)   // true while a sentence is playing
  const drainQueueRef         = useRef(null)    // stable ref to drain function
  const sessionIdRef          = useRef(null)
  const reconnectTimerRef     = useRef(null)
  const attemptsRef           = useRef(0)
  const discardInFlightRef    = useRef(false)   // true after chip click until new transcript arrives
  const pendingGreetingBufRef = useRef(null)
  const isGreetingExpectedRef = useRef(false)
  const hasGreetedRef         = useRef(false)   // send greeting only once per page load
  const messagesEndRef        = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, phase])

  // ── Audio queue (sentence-level streaming) ────────────────────────────────
  // drainQueue is defined as a plain function (not useCallback) so it can
  // reference itself via the stable drainQueueRef without circular deps.
  function drainQueue(isGreeting = false) {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      setPhase('idle')
      return
    }
    isPlayingRef.current = true
    const buf  = audioQueueRef.current.shift()
    const blob = new Blob([buf], { type: 'audio/mpeg' })
    const url  = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudioRef.current = audio
    setPhase('speaking')
    audio.onended = () => {
      URL.revokeObjectURL(url); currentAudioRef.current = null
      drainQueueRef.current()   // play next sentence
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url); currentAudioRef.current = null
      drainQueueRef.current()
    }
    audio.play()
      .then(() => { if (isGreeting) setGreetingPending(false) })
      .catch(() => {
        URL.revokeObjectURL(url); currentAudioRef.current = null
        isPlayingRef.current = false
        if (isGreeting) { pendingGreetingBufRef.current = buf; setGreetingPending(true) }
        setPhase('idle')
      })
  }
  // Keep ref up-to-date on every render so audio.onended always gets latest
  drainQueueRef.current = drainQueue

  const enqueueAudio = useCallback((buf, isGreeting = false) => {
    audioQueueRef.current.push(buf)
    if (!isPlayingRef.current) drainQueueRef.current(isGreeting)
  }, [])

  const playPendingGreeting = useCallback(() => {
    const buf = pendingGreetingBufRef.current
    if (!buf) return
    pendingGreetingBufRef.current = null
    setGreetingPending(false)
    audioQueueRef.current.unshift(buf)
    if (!isPlayingRef.current) drainQueueRef.current(false)
  }, [])

  const stopAudio = useCallback(() => {
    audioQueueRef.current = []         // flush pending sentences
    isPlayingRef.current  = false
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }
  }, [])

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    if (socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
       socketRef.current.readyState === WebSocket.CONNECTING)) return
    if (!sessionIdRef.current) sessionIdRef.current = getOrCreateSessionId()
    const url = `${VOICE_WS_BASE}?session_id=${sessionIdRef.current}`
    setConnState(attemptsRef.current > 0 ? 'reconnecting' : 'connecting')
    const ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'

    ws.onopen = () => {
      attemptsRef.current = 0
      setConnState('connected')
      setErrMsg('')
      // Only greet once per page load — reconnects must NOT re-trigger greeting
      if (!hasGreetedRef.current) {
        hasGreetedRef.current = true
        isGreetingExpectedRef.current = true
        ws.send(JSON.stringify({ type: 'greeting' }))
      }
    }

    ws.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        if (discardInFlightRef.current) return  // stale audio from previous response
        const isGreeting = isGreetingExpectedRef.current
        isGreetingExpectedRef.current = false
        setJdSubmitting(false)
        enqueueAudio(e.data, isGreeting)   // queue sentence audio; plays as soon as previous ends
        return
      }
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'transcript') {
          discardInFlightRef.current = false  // new response starting — accept audio again
          setMessages(prev => {
            // Skip if we already added this text optimistically (text_query chip click)
            const last = prev[prev.length - 1]
            if (last?.role === 'user' && last.text === msg.text) return prev
            return [...prev, { role: 'user', text: msg.text }]
          })
        }
        // Sentence chunk — append to current streaming bot message
        if (msg.type === 'response_text_chunk') {
          if (discardInFlightRef.current) return  // stale chunk from previous response
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last?.role === 'bot' && last.isStreaming) {
              return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + msg.text }]
            }
            return [...prev, { role: 'bot', text: msg.text, isStreaming: true }]
          })
        }
        // Final complete text — seal streaming message + fire PDF highlight hook
        if (msg.type === 'response_text') {
          if (discardInFlightRef.current) return  // stale response_text from previous response
          setJdSubmitting(false)  // safety: reset even if no audio arrived
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last?.role === 'bot' && last.isStreaming) {
              return [...prev.slice(0, -1), { role: 'bot', text: msg.text }]
            }
            return [...prev, { role: 'bot', text: msg.text }]
          })
          onResponseText?.(stripBlocks(msg.text))
        }
        if (msg.type === 'error') { setErrMsg(msg.message); setPhase('idle'); setJdSubmitting(false) }
      } catch { /* ignore */ }
    }

    ws.onerror  = () => setPhase('idle')
    ws.onclose  = () => {
      socketRef.current = null
      setConnState('disconnected'); setPhase('idle'); stopAudio()
      if (attemptsRef.current < MAX_RECONNECT) {
        const delay = Math.min(BASE_DELAY_MS * 2 ** attemptsRef.current, 30_000)
        attemptsRef.current++
        setConnState('reconnecting')
        reconnectTimerRef.current = setTimeout(connectSocket, delay)
      }
    }
    socketRef.current = ws
  }, [enqueueAudio, stopAudio])

  const teardown = useCallback(() => {
    clearTimeout(reconnectTimerRef.current)
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop())
    mediaRecorderRef.current = null; stopAudio()
    socketRef.current?.close(); socketRef.current = null; attemptsRef.current = 0
  }, [stopAudio])

  useEffect(() => { connectSocket(); return () => teardown() }, [connectSocket, teardown])

  // ── Recording ─────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (connState !== 'connected') return
    if (greetingPending) { playPendingGreeting(); return }
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,   // WebRTC AEC — stops agent hearing itself
          noiseSuppression: true,
          autoGainControl:  true,
          channelCount:     1,      // mono is ideal for Whisper STT
        }
      })
    } catch { setErrMsg('Microphone access denied.'); return }
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    audioChunksRef.current = []
    recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(audioChunksRef.current, { type: mimeType })
      audioChunksRef.current = []
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(await blob.arrayBuffer())
        track('cogni_voice_message_sent')
        setPhase('processing')
      } else setPhase('idle')
    }
    mediaRecorderRef.current = recorder
    recorder.start()
    track('cogni_voice_started')
    setPhase('listening'); setErrMsg('')
  }, [connState, greetingPending, playPendingGreeting])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
  }, [])

  const handleOrbClick = useCallback(() => {
    if (connState === 'disconnected')  { connectSocket(); return }
    if (connState !== 'connected')    return
    if (greetingPending)              { playPendingGreeting(); return }
    if (phase === 'idle')             startRecording()
    else if (phase === 'listening')   stopRecording()
    else if (phase === 'speaking')    { stopAudio(); setPhase('idle') }
  }, [connState, greetingPending, phase, startRecording, stopRecording, stopAudio, connectSocket, playPendingGreeting])

  // ── Query / JD ────────────────────────────────────────────────────────────
  const sendQuery = useCallback((text) => {
    if (!text.trim() || socketRef.current?.readyState !== WebSocket.OPEN) return
    stopAudio()   // flush queue + stop current audio
    discardInFlightRef.current = true  // ignore stale audio/text from old response
    // Seal any half-finished streaming bot message so it doesn't keep growing
    setMessages(prev => {
      const last = prev[prev.length - 1]
      if (last?.role === 'bot' && last.isStreaming) {
        return [...prev.slice(0, -1), { ...last, isStreaming: false }]
      }
      return prev
    })
    socketRef.current.send(JSON.stringify({ type: 'text_query', text }))
    setMessages(prev => [...prev, { role: 'user', text }])
    setPhase('processing')
  }, [stopAudio])

  const sendJD = useCallback(() => {
    const jd = jdText.trim()
    if (!jd || socketRef.current?.readyState !== WebSocket.OPEN || jdSubmitting) return
    socketRef.current.send(JSON.stringify({ type: 'jd_text', text: jd }))
    track('cogni_jd_analyzed', { jd_length: jd.length })
    const preview = jd.length > 100 ? jd.slice(0, 100) + '…' : jd
    setMessages(prev => [...prev, { role: 'user', text: preview, isJD: true }])
    setJdText(''); setJdOpen(false); setJdSubmitting(true); setPhase('processing')
  }, [jdText, jdSubmitting])

  // ── Derived ───────────────────────────────────────────────────────────────
  const phaseInfo = PHASE[phase]
  const connInfo  = CONN[connState]
  const orbReady  = connState === 'connected'
  const isActive  = phase === 'listening' || phase === 'processing' || phase === 'speaking'

  useImperativeHandle(ref, () => ({ triggerOrb: handleOrbClick }), [handleOrbClick])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    const text = lastMsg
      ? (lastMsg.role === 'bot' ? stripBlocks(lastMsg.text) : lastMsg.text)
      : ''
    onStatusChange?.(phase, text)
  }, [phase, messages, onStatusChange])

  const orbHint =
    greetingPending ? '▶ Tap to hear welcome' :
    connState !== 'connected' ? connInfo.label :
    phase === 'listening'     ? 'Release to send' :
    phase === 'speaking'      ? 'Tap to stop' :
    phase === 'processing'    ? 'Processing…' :
                                'Hold & speak'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        /* ── Keyframes ── */
        @keyframes ringA     { to { transform: rotate(360deg); } }
        @keyframes ringB     { to { transform: rotate(-360deg); } }
        @keyframes orbBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes listenPulse { 0%,100%{box-shadow:0 0 0 0 hsla(142,70%,45%,.5)} 70%{box-shadow:0 0 0 18px hsla(142,70%,45%,0)} }
        @keyframes waveBar   { from{transform:scaleY(1)} to{transform:scaleY(2.2)} }
        @keyframes msgIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scIn      { from{opacity:0;transform:translateY(8px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes connBlink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes greetPulse{ 0%,100%{box-shadow:0 0 0 0 hsla(38,100%,55%,.55)} 70%{box-shadow:0 0 0 16px hsla(38,100%,55%,0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .rva-wrap { display:flex; flex-direction:column; flex:1; min-height:0; background:hsl(222,47%,6%); }

        /* ── Orb section ── */
        .rva-orb-section {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px 24px;
          flex-shrink: 0;
          overflow: hidden;
        }

        /* Rings */
        .rva-ring-outer,.rva-ring-mid { position:absolute; border-radius:50%; pointer-events:none; }
        .rva-ring-outer { width:220px; height:220px; border:1px solid hsla(270,100%,60%,.2); animation:ringA 12s linear infinite; }
        .rva-ring-mid   { width:182px; height:182px; border:1px solid hsla(180,100%,55%,.18); animation:ringB 8s linear infinite; }

        /* Ring dots */
        .rva-ring-dot { position:absolute; top:-4px; left:50%; transform:translateX(-50%); width:7px; height:7px; border-radius:50%; }

        /* Shader orb wrapper */
        .rva-orb-wrap {
          position: relative; z-index: 2; border-radius: 50%;
          cursor: pointer; transition: transform .2s, box-shadow .4s;
          user-select: none;
        }
        .rva-orb-wrap:hover:not(.orb-blocked) { transform: scale(1.05); }
        .rva-orb-wrap.orb-blocked { cursor: not-allowed; opacity: .5; }
        .rva-orb-wrap.orb-listening { animation: listenPulse 1s ease-out infinite; }
        .rva-orb-wrap.orb-greeting  { animation: greetPulse 1.6s ease-out infinite; }
        .rva-orb-wrap:not(.orb-blocked):not(.orb-listening) { animation: orbBreath 3.5s ease-in-out infinite; }

        /* Connection badge */
        .rva-conn-dot.blink { animation: connBlink 1s ease-in-out infinite; }

        /* Message bubbles */
        .rva-msg { animation: msgIn .22s ease-out; }

        /* Suggestion chips */
        .rva-chip {
          padding: 7px 14px; border-radius: 999px; cursor: pointer;
          font-size: .75rem; font-family: Inter,sans-serif; font-weight: 500;
          border: 1px solid hsla(270,50%,35%,.4);
          background: hsla(270,50%,18%,.5);
          color: hsl(270,60%,80%);
          transition: all .18s; white-space: nowrap;
        }
        .rva-chip:hover { background: hsla(270,50%,26%,.7); border-color: hsla(270,60%,55%,.6); color: hsl(270,80%,90%); transform: translateY(-1px); }
        .rva-chip:disabled { opacity: .4; cursor: not-allowed; transform: none; }

        /* JD toggle */
        .rva-jd-toggle { transition: color .2s; }
        .rva-jd-toggle:hover { color: hsl(210,100%,65%) !important; }

        /* Analyze button */
        .rva-analyze:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
        .rva-analyze:active:not(:disabled) { transform: translateY(0); }

        /* Shimmer text on empty state */
        .rva-shimmer {
          background: linear-gradient(90deg, hsl(270,60%,75%) 0%, hsl(180,80%,70%) 40%, hsl(270,60%,75%) 80%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="rva-wrap">

        {/* ── Header ── */}
        <div style={{
          padding: '14px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid hsl(222,30%,12%)',
          background: 'linear-gradient(180deg, hsl(222,47%,8%) 0%, hsl(222,47%,7%) 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Cogni logo */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, hsl(270,100%,62%) 0%, hsl(200,100%,52%) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px hsla(270,100%,60%,0.35)',
            }}>
              <SparkleIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2, letterSpacing: '0.01em' }}>
                Cogni
              </div>
              <div style={{ fontSize: '0.68rem', color: 'hsl(215,20%,48%)', fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                Shubhanker's AI Voice Assistant
              </div>
            </div>
          </div>

          {/* Connection pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            borderRadius: 999, background: 'hsl(222,47%,10%)',
            border: '1px solid hsl(222,30%,17%)',
          }}>
            <span
              className={`rva-conn-dot ${connInfo.pulse ? 'blink' : ''}`}
              style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: connInfo.color, transition: 'background .3s' }}
            />
            <span style={{ fontSize: '0.7rem', color: 'hsl(215,20%,48%)', fontFamily: 'Inter, sans-serif' }}>
              {connInfo.label}
            </span>
          </div>
        </div>

        {/* ── Orb section ── */}
        {compact ? (
          /* ── Compact horizontal strip (mobile) ── */
          <div style={{
            position: 'relative', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px 10px',
            overflow: 'hidden',
            borderBottom: '1px solid hsl(222,30%,12%)',
          }}>
            {/* Aurora background */}
            <AuroraCanvas phase={phase} />

            {/* Small orb */}
            <div style={{ position: 'relative', flexShrink: 0, zIndex: 2 }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                background: phaseInfo.glow, filter: 'blur(12px)',
                transition: 'background 0.5s ease', pointerEvents: 'none',
              }} />
              <div
                className={`rva-orb-wrap ${!orbReady ? 'orb-blocked' : greetingPending ? 'orb-greeting' : phase === 'listening' ? 'orb-listening' : ''}`}
                onClick={handleOrbClick}
                title={orbHint}
              >
                <OrbShader phase={greetingPending ? 'idle' : phase} size={68} />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                  color: 'rgba(255,255,255,0.90)',
                  filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.55))',
                }}>
                  {phase === 'listening' ? <StopIcon size={18} /> : <MicIcon size={18} />}
                </div>
              </div>
            </div>

            {/* Status column */}
            <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <p style={{
                margin: 0, fontSize: '0.73rem', fontWeight: 600,
                color: greetingPending ? 'hsl(38,100%,65%)' : phaseInfo.color,
                fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em',
                transition: 'color 0.3s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {greetingPending ? '▶ Tap orb to hear welcome' : orbHint}
              </p>
              <Waveform active={isActive} phase={phase} />
              {errMsg && (
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'hsl(0,65%,62%)', fontFamily: 'Inter, sans-serif' }}>
                  {errMsg}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ── Full orb section (desktop) ── */
          <div className="rva-orb-section">
            {/* WebGL aurora fluid background */}
            <AuroraCanvas phase={phase} />

            {/* Rings + Orb wrapper */}
            <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {/* Outer ring */}
              <div className="rva-ring-outer">
                <div className="rva-ring-dot" style={{ background: 'hsl(270,100%,72%)', boxShadow: '0 0 8px hsl(270,100%,65%)' }} />
              </div>
              {/* Mid ring */}
              <div className="rva-ring-mid">
                <div className="rva-ring-dot" style={{ width: 5, height: 5, background: 'hsl(180,100%,60%)', boxShadow: '0 0 6px hsl(180,100%,55%)' }} />
              </div>

              {/* Glow layer behind orb */}
              <div style={{
                position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                background: phaseInfo.glow, filter: 'blur(24px)',
                transition: 'background 0.5s ease',
                pointerEvents: 'none',
              }} />

              {/* WebGL shader orb + mic icon overlay */}
              <div
                className={`rva-orb-wrap ${!orbReady ? 'orb-blocked' : greetingPending ? 'orb-greeting' : phase === 'listening' ? 'orb-listening' : ''}`}
                onClick={handleOrbClick}
                title={orbHint}
              >
                <OrbShader phase={greetingPending ? 'idle' : phase} size={136} />
                {/* Icon floated over the shader canvas */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                  color: 'rgba(255,255,255,0.90)',
                  filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.55))',
                }}>
                  {phase === 'listening' ? <StopIcon size={30} /> : <MicIcon size={30} />}
                </div>
              </div>
            </div>

            {/* Waveform */}
            <Waveform active={isActive} phase={phase} />

            {/* Phase / hint label */}
            <p style={{
              marginTop: 10, marginBottom: 0,
              fontSize: '0.78rem', fontWeight: 600,
              color: greetingPending ? 'hsl(38,100%,65%)' : phaseInfo.color,
              fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em',
              textAlign: 'center', transition: 'color 0.3s',
            }}>
              {greetingPending ? '▶ Tap orb to hear welcome greeting' : orbHint}
            </p>

            {errMsg && (
              <p style={{ marginTop: 6, fontSize: '0.72rem', color: 'hsl(0,65%,62%)', fontFamily: 'Inter, sans-serif', textAlign: 'center', maxWidth: 240 }}>
                {errMsg}
              </p>
            )}
          </div>
        )}

        {/* Divider — only on desktop (compact strip already has border-bottom) */}
        {!compact && <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, hsl(222,30%,16%), transparent)', flexShrink: 0 }} />}

        {/* ── Conversation area ── */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 ? (
            /* ── Empty / intro state ── */
            <div style={{ paddingTop: 4 }}>
              <p style={{ margin: '0 0 16px', fontSize: '0.88rem', textAlign: 'center', lineHeight: 1.6 }}>
                <span className="rva-shimmer" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.92rem' }}>
                  Ask me anything about Shubhanker
                </span>
              </p>

              {/* Suggestion chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    className="rva-chip"
                    disabled={connState !== 'connected'}
                    onClick={() => { track('cogni_suggestion_clicked', { question: s }); sendQuery(s) }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <p style={{ margin: 0, fontSize: '0.72rem', color: 'hsl(215,20%,32%)', fontFamily: 'Inter, sans-serif', textAlign: 'center', lineHeight: 1.6 }}>
                Or tap the orb above to speak · Paste a JD below for fit analysis
              </p>
              {phase === 'processing' && (
                <div style={{ marginTop: 14 }}>
                  <ProcessingSteps isJD={jdSubmitting} />
                </div>
              )}
            </div>
          ) : (
            /* ── Messages ── */
            <>
              {messages.map((msg, i) => {
                const sc = msg.role === 'bot' && !msg.isStreaming ? parseScorecard(msg.text) : null
                const displayText = msg.role === 'bot' ? stripBlocks(msg.text) : msg.text
                // Show dynamic suggestions only below the last bot message when idle/speaking
                const isLastBotMsg = msg.role === 'bot' && !msg.isStreaming &&
                  messages.slice(i + 1).every(m => m.role !== 'bot')
                const dynSuggestions = isLastBotMsg && phase !== 'processing'
                  ? parseSuggestions(msg.text)
                  : []
                return (
                <div key={i} className="rva-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'user' ? (
                    <div style={{
                      background: 'hsl(222,47%,14%)',
                      border: '1px solid hsl(222,30%,22%)',
                      borderRadius: '14px 14px 4px 14px',
                      padding: '9px 14px', maxWidth: '85%',
                    }}>
                      {msg.isJD && <span style={{ display: 'block', fontSize: '0.6rem', color: 'hsl(210,100%,62%)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'Inter, sans-serif' }}>JD Analysis</span>}
                      <span style={{ display: 'block', fontSize: '0.6rem', color: 'hsl(215,20%,38%)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'Inter, sans-serif' }}>You</span>
                      <span style={{ fontSize: '0.83rem', color: 'hsl(210,40%,87%)', fontFamily: 'Inter, sans-serif', lineHeight: 1.55 }}>{msg.text}</span>
                    </div>
                  ) : (
                    <div style={{ maxWidth: '94%', display: 'flex', flexDirection: 'column' }}>
                      {sc && <JDScorecard data={sc} />}
                      <div style={{
                        background: 'linear-gradient(135deg, hsla(265,55%,13%,.9) 0%, hsla(185,55%,10%,.7) 100%)',
                        border: '1px solid hsla(270,45%,26%,.45)',
                        borderRadius: '14px 14px 14px 4px',
                        padding: '9px 14px',
                      }}>
                        <span style={{ display: 'block', fontSize: '0.6rem', color: 'hsl(270,40%,58%)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'Inter, sans-serif' }}>Cogni</span>
                        <span style={{ fontSize: '0.83rem', color: 'hsl(275,55%,92%)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                          <BotText text={displayText} />
                        </span>
                      </div>
                      {dynSuggestions.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
                          {dynSuggestions.map((s, si) => (
                            <button key={si} className="rva-chip"
                              disabled={connState !== 'connected'}
                              onClick={() => { track('cogni_suggestion_clicked', { question: s }); sendQuery(s) }}
                              style={{ fontSize: '0.68rem', padding: '5px 11px', whiteSpace: 'normal', textAlign: 'left', maxWidth: '100%' }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )})}

              {phase === 'processing' && (
                <div className="rva-msg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <ProcessingSteps isJD={jdSubmitting} />
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ── JD Panel ── */}
        <div style={{ flexShrink: 0, borderTop: '1px solid hsl(222,30%,13%)', background: 'hsl(222,47%,7%)' }}>
          <button
            className="rva-jd-toggle"
            onClick={() => setJdOpen(o => !o)}
            style={{
              width: '100%', padding: '11px 18px',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: jdOpen ? 'hsl(210,100%,65%)' : 'hsl(215,20%,48%)',
              fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <DocIcon size={13} />
            {jdOpen ? 'Hide JD panel' : '📋  Paste JD · Analyze Job Fit'}
            <span style={{ marginLeft: 'auto', fontSize: '0.62rem', opacity: .4 }}>{jdOpen ? '▲' : '▼'}</span>
          </button>

          {jdOpen && (
            <div style={{ padding: '0 16px 14px' }}>
              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value.slice(0, JD_MAX_CHARS))}
                placeholder="Paste the job description here…"
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(222,47%,9%)', border: '1px solid hsl(222,30%,19%)',
                  borderRadius: 10, padding: '9px 12px',
                  color: 'hsl(210,40%,85%)', fontSize: '0.78rem',
                  fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                  resize: 'vertical', outline: 'none', transition: 'border-color .2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'hsl(210,100%,56%)')}
                onBlur={e => (e.target.style.borderColor = 'hsl(222,30%,19%)')}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ fontSize: '0.62rem', color: 'hsl(215,20%,32%)', fontFamily: 'Inter, sans-serif' }}>{jdText.length}/{JD_MAX_CHARS}</span>
                <button
                  className="rva-analyze"
                  onClick={sendJD}
                  disabled={!jdText.trim() || connState !== 'connected' || jdSubmitting}
                  style={{
                    padding: '9px 24px', borderRadius: 9, border: 'none',
                    background: jdText.trim() && connState === 'connected' && !jdSubmitting
                      ? 'linear-gradient(135deg, hsl(210,100%,56%), hsl(270,100%,60%))'
                      : 'hsl(222,30%,17%)',
                    color: jdText.trim() && connState === 'connected' && !jdSubmitting ? '#fff' : 'hsl(215,20%,34%)',
                    fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                    cursor: jdText.trim() && connState === 'connected' && !jdSubmitting ? 'pointer' : 'not-allowed',
                    transition: 'all .2s',
                  }}
                >
                  {jdSubmitting ? 'Analyzing…' : 'Analyze Fit →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '6px 16px 8px', borderTop: '1px solid hsl(222,30%,10%)', background: 'hsl(222,47%,6%)', flexShrink: 0 }}>
          <p style={{ textAlign: 'center', margin: 0, fontSize: '0.63rem', color: 'hsl(215,20%,28%)', fontFamily: 'Inter, sans-serif' }}>
            Powered by GPT-4o · ElevenLabs · Cogni for Shubhanker Goswami
          </p>
        </div>

      </div>
    </>
  )
})
export default RecruiterVoiceAgent
