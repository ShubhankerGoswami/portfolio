import { useState, useRef, useCallback, useEffect } from 'react'

// ── Config ────────────────────────────────────────────────────────────────────
const VOICE_WS_BASE =
  window.location.host.split(':')[0] === 'localhost'
    ? 'ws://localhost:10000/ws/voice'
    : 'wss://portfoliobackend-q666.onrender.com/ws/voice'

const SESSION_KEY   = 'va_session_id'
const MAX_RECONNECT = 5
const BASE_DELAY_MS = 1000

// ── Session ID ────────────────────────────────────────────────────────────────
function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const MicIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

// ── Phase + connection config ─────────────────────────────────────────────────
const PHASE_CONFIG = {
  idle:       { label: 'Tap the orb to speak', color: 'hsl(215,20%,55%)' },
  listening:  { label: 'Listening…',            color: 'hsl(142,70%,55%)' },
  processing: { label: 'Processing…',           color: 'hsl(210,100%,65%)' },
  speaking:   { label: 'Speaking…',             color: 'hsl(280,100%,70%)' },
}

const CONN_CONFIG = {
  disconnected: { label: 'Disconnected', color: 'hsl(0,70%,55%)',   pulse: false },
  connecting:   { label: 'Connecting…',  color: 'hsl(38,100%,55%)', pulse: true  },
  connected:    { label: 'Connected',    color: 'hsl(142,70%,45%)', pulse: false },
  reconnecting: { label: 'Reconnecting…',color: 'hsl(38,100%,55%)', pulse: true  },
}

// ── Renders bot text, turning any https:// URL into a clickable button ────────
const URL_RE = /(https?:\/\/[^\s]+)/g
function BotTextWithLink({ text }) {
  const parts = text.split(URL_RE)
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block', marginTop: 8,
              padding: '6px 12px',
              background: 'linear-gradient(135deg, hsl(270,100%,60%) 0%, hsl(180,100%,50%) 100%)',
              color: 'hsl(222,47%,6%)',
              borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
              textDecoration: 'none', fontFamily: 'Inter, sans-serif',
            }}
          >
            Book Meeting →
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VoiceAgent() {
  const [isOpen,    setIsOpen]    = useState(false)
  const [phase,     setPhase]     = useState('idle')
  const [connState, setConnState] = useState('disconnected')
  const [userText,  setUserText]  = useState('')
  const [botText,   setBotText]   = useState('')
  const [errMsg,    setErrMsg]    = useState('')

  const socketRef         = useRef(null)
  const mediaRecorderRef  = useRef(null)
  const audioChunksRef    = useRef([])
  const currentAudioRef   = useRef(null)   // HTMLAudioElement being played
  const sessionIdRef      = useRef(null)
  const reconnectTimerRef = useRef(null)
  const attemptsRef       = useRef(0)
  const isOpenRef         = useRef(false)

  useEffect(() => { isOpenRef.current = isOpen }, [isOpen])

  // ── Audio playback ────────────────────────────────────────────────────────
  const playAudioBuffer = useCallback((arrayBuffer) => {
    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
    const url  = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudioRef.current = audio
    setPhase('speaking')
    audio.onended = () => {
      URL.revokeObjectURL(url)
      currentAudioRef.current = null
      setPhase('idle')
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      currentAudioRef.current = null
      setPhase('idle')
    }
    audio.play().catch(() => setPhase('idle'))
  }, [])

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
  }, [])

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
       socketRef.current.readyState === WebSocket.CONNECTING)
    ) return

    if (!sessionIdRef.current) sessionIdRef.current = getOrCreateSessionId()

    const url = `${VOICE_WS_BASE}?session_id=${sessionIdRef.current}`
    setConnState(attemptsRef.current > 0 ? 'reconnecting' : 'connecting')

    const ws = new WebSocket(url)
    ws.binaryType = 'arraybuffer'   // receive audio as ArrayBuffer, not Blob

    ws.onopen = () => {
      attemptsRef.current = 0
      setConnState('connected')
      setErrMsg('')
      console.log('[VoiceAgent] connected | session:', sessionIdRef.current)
    }

    ws.onmessage = (e) => {
      // binary frame = ElevenLabs mp3 audio
      if (e.data instanceof ArrayBuffer) {
        playAudioBuffer(e.data)
        return
      }
      // text frame = JSON control message
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'transcript')    { setUserText(msg.text); setBotText('') }
        if (msg.type === 'response_text') setBotText(msg.text)
        if (msg.type === 'error')         { setErrMsg(msg.message); setPhase('idle') }
        if (msg.type === 'pong')          console.debug('[VoiceAgent] pong')
      } catch {
        console.warn('[VoiceAgent] unparseable message', e.data)
      }
    }

    ws.onerror = (err) => {
      console.warn('[VoiceAgent] WS error', err)
      setPhase('idle')
    }

    ws.onclose = () => {
      socketRef.current = null
      setConnState('disconnected')
      setPhase('idle')
      stopAudio()

      if (isOpenRef.current && attemptsRef.current < MAX_RECONNECT) {
        const delay = Math.min(BASE_DELAY_MS * 2 ** attemptsRef.current, 30_000)
        attemptsRef.current += 1
        console.log(`[VoiceAgent] reconnect attempt ${attemptsRef.current}/${MAX_RECONNECT} in ${delay}ms`)
        setConnState('reconnecting')
        reconnectTimerRef.current = setTimeout(connectSocket, delay)
      }
    }

    socketRef.current = ws
  }, [playAudioBuffer, stopAudio])

  // ── Teardown ──────────────────────────────────────────────────────────────
  const teardown = useCallback(() => {
    clearTimeout(reconnectTimerRef.current)
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop())
    mediaRecorderRef.current = null
    stopAudio()
    socketRef.current?.close()
    socketRef.current   = null
    attemptsRef.current = 0
  }, [stopAudio])

  const handleOpen = () => {
    setIsOpen(true)
    connectSocket()
  }

  const handleClose = () => {
    teardown()
    setIsOpen(false)
    setPhase('idle')
    setConnState('disconnected')
    setUserText('')
    setBotText('')
    setErrMsg('')
  }

  useEffect(() => () => teardown(), [teardown])

  // ── MediaRecorder (microphone → binary WS) ────────────────────────────────
  const startRecording = useCallback(async () => {
    if (connState !== 'connected') return

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setErrMsg('Microphone access denied.')
      return
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(stream, { mimeType })
    audioChunksRef.current = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data)
    }

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      const blob = new Blob(audioChunksRef.current, { type: mimeType })
      audioChunksRef.current = []

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        const buffer = await blob.arrayBuffer()
        socketRef.current.send(buffer)
        setPhase('processing')
      } else {
        setPhase('idle')
      }
    }

    mediaRecorderRef.current = recorder
    recorder.start()
    setPhase('listening')
    setErrMsg('')
  }, [connState])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  // ── Orb click handler ─────────────────────────────────────────────────────
  const handleOrbClick = () => {
    if (connState === 'disconnected') { connectSocket(); return }
    if (connState !== 'connected')   return

    if      (phase === 'idle')      startRecording()
    else if (phase === 'listening') stopRecording()
    else if (phase === 'speaking')  { stopAudio(); setPhase('idle') }
  }

  // ── Derived display ───────────────────────────────────────────────────────
  const phaseInfo = PHASE_CONFIG[phase]
  const connInfo  = CONN_CONFIG[connState]
  const orbReady  = connState === 'connected'

  const orbHint =
    connState === 'connecting'   ? 'Connecting to server…' :
    connState === 'reconnecting' ? `Reconnecting… (${attemptsRef.current}/${MAX_RECONNECT})` :
    connState === 'disconnected' ? 'Tap orb to reconnect' :
    phase === 'listening'        ? 'Tap orb to send' :
    phase === 'speaking'         ? 'Tap orb to stop' :
                                   'Tap the orb · speak clearly'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes vaOrbPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.1); }
        }
        @keyframes vaRingRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes vaSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes vaTogglePulse {
          0%, 100% { box-shadow: 0 0 0 0 hsla(270,100%,60%,0.5), 0 8px 32px -8px hsla(0,0%,0%,0.5); }
          50%       { box-shadow: 0 0 0 9px hsla(270,100%,60%,0),  0 8px 32px -8px hsla(0,0%,0%,0.5); }
        }
        @keyframes vaListenRing {
          0%, 100% { box-shadow: 0 0 0 0   hsla(142,70%,45%,0.55); }
          50%       { box-shadow: 0 0 0 18px hsla(142,70%,45%,0);   }
        }
        @keyframes vaConnBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }

        .va-orb-wrap {
          position: relative;
          width: 120px; height: 120px;
          user-select: none; flex-shrink: 0;
        }
        .va-orb-wrap::before {
          content: "";
          position: absolute; inset: -10px; border-radius: 50%;
          background: linear-gradient(45deg, purple, cyan);
          filter: blur(8px); opacity: 0.65;
          animation: vaRingRotate 6s linear infinite;
        }
        .va-orb-wrap.orb-ready    { cursor: pointer; }
        .va-orb-wrap.orb-disabled { cursor: not-allowed; opacity: 0.55; }

        .va-orb-inner {
          position: relative; z-index: 1;
          width: 120px; height: 120px; border-radius: 50%;
          background: radial-gradient(circle, rgba(120,0,255,0.22), transparent);
          border: 1px solid rgba(160,0,255,0.28);
          display: flex; align-items: center; justify-content: center;
          animation: vaOrbPulse 2s infinite ease-in-out;
          transition: background 0.35s, border-color 0.35s;
        }
        .va-orb-inner.listening {
          background: radial-gradient(circle, rgba(0,210,100,0.28), transparent);
          border-color: rgba(0,210,100,0.45);
          animation: vaOrbPulse 0.75s infinite ease-in-out, vaListenRing 1.1s infinite ease-out;
        }
        .va-orb-inner.processing {
          background: radial-gradient(circle, rgba(50,150,255,0.28), transparent);
          border-color: rgba(50,150,255,0.45);
          animation: vaOrbPulse 1.6s infinite ease-in-out;
        }
        .va-orb-inner.speaking {
          background: radial-gradient(circle, rgba(160,80,255,0.35), transparent);
          border-color: rgba(160,80,255,0.55);
          animation: vaOrbPulse 1.4s infinite ease-in-out;
        }

        .va-toggle:hover    { transform: scale(1.08) !important; filter: brightness(1.15); }
        .va-close-btn:hover { background: hsla(0,60%,50%,0.2) !important; color: hsl(0,80%,72%) !important; }
        .va-conn-blink      { animation: vaConnBlink 1s ease-in-out infinite; }
      `}</style>

      {/* ── Panel ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 96, right: 92, zIndex: 1001,
          width: 300,
          display: 'flex', flexDirection: 'column',
          background: 'hsl(222,47%,8%)',
          border: '1px solid hsl(222,30%,17%)',
          borderRadius: 18,
          boxShadow: '0 28px 72px -12px hsla(0,0%,0%,0.65), 0 0 0 1px hsla(270,100%,60%,0.07)',
          animation: 'vaSlideUp 0.25s ease-out',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 14px',
            background: 'linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(270,40%,13%) 100%)',
            borderBottom: '1px solid hsl(222,30%,17%)',
            flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: 'linear-gradient(135deg, hsl(270,100%,60%) 0%, hsl(180,100%,50%) 100%)',
              borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(222,47%,6%)',
            }}>
              <MicIcon size={18} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600, fontSize: '0.95rem',
                color: 'hsl(210,40%,98%)', lineHeight: 1.2,
              }}>
                Voice Agent
              </div>

              {/* phase row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <span style={{
                  display: 'block', width: 6, height: 6, borderRadius: '50%',
                  background: phaseInfo.color,
                  boxShadow: `0 0 5px ${phaseInfo.color}`,
                  transition: 'all 0.3s',
                }} />
                <span style={{ fontSize: '0.7rem', color: 'hsl(215,20%,62%)', fontFamily: 'Inter, sans-serif' }}>
                  {phaseInfo.label}
                </span>
              </div>

              {/* connection row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span
                  className={connInfo.pulse ? 'va-conn-blink' : ''}
                  style={{
                    display: 'block', width: 6, height: 6, borderRadius: '50%',
                    background: connInfo.color, transition: 'background 0.3s',
                  }}
                />
                <span style={{ fontSize: '0.68rem', color: 'hsl(215,20%,42%)', fontFamily: 'Inter, sans-serif' }}>
                  {connInfo.label}
                  {connState === 'connected' && (
                    <span style={{ color: 'hsl(215,20%,30%)', marginLeft: 4 }}>
                      · {sessionIdRef.current?.slice(0, 8)}…
                    </span>
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="va-close-btn"
              style={{
                background: 'hsla(222,30%,20%,0.8)',
                border: '1px solid hsl(222,30%,25%)',
                borderRadius: 9, padding: 7, cursor: 'pointer',
                color: 'hsl(215,20%,60%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              <CloseIcon size={14} />
            </button>
          </div>

          {/* Orb + transcript */}
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '32px 20px 24px',
            background: 'hsl(222,47%,8%)',
          }}>
            <div
              className={`va-orb-wrap ${orbReady ? 'orb-ready' : 'orb-disabled'}`}
              onClick={handleOrbClick}
              title={orbHint}
            >
              <div className={`va-orb-inner ${phase}`}>
                <span style={{ color: 'rgba(210,160,255,0.85)' }}>
                  <MicIcon size={34} />
                </span>
              </div>
            </div>

            <p style={{
              marginTop: 18, marginBottom: 0,
              fontSize: '0.8rem', fontWeight: 500,
              color: orbReady ? phaseInfo.color : connInfo.color,
              fontFamily: 'Inter, sans-serif',
              textAlign: 'center',
              transition: 'color 0.3s',
            }}>
              {orbReady ? phaseInfo.label : connInfo.label}
            </p>

            {/* Error */}
            {errMsg && (
              <p style={{
                marginTop: 10, marginBottom: 0,
                fontSize: '0.75rem', color: 'hsl(0,70%,60%)',
                fontFamily: 'Inter, sans-serif', textAlign: 'center',
              }}>
                {errMsg}
              </p>
            )}

            {/* Transcript cards */}
            {(userText || botText) && (
              <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {userText && (
                  <div style={{
                    background: 'hsl(222,47%,12%)',
                    border: '1px solid hsl(222,30%,20%)',
                    borderRadius: 10, padding: '8px 12px',
                    fontSize: '0.82rem', color: 'hsl(210,40%,82%)',
                    fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                  }}>
                    <span style={{
                      color: 'hsl(215,20%,42%)', fontSize: '0.68rem',
                      display: 'block', marginBottom: 3,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>You</span>
                    {userText}
                  </div>
                )}
                {botText && (
                  <div style={{
                    background: 'linear-gradient(135deg, hsla(270,60%,15%,0.8), hsla(180,60%,10%,0.6))',
                    border: '1px solid hsla(270,50%,30%,0.4)',
                    borderRadius: 10, padding: '8px 12px',
                    fontSize: '0.82rem', color: 'hsl(280,60%,88%)',
                    fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                  }}>
                    <span style={{
                      color: 'hsl(270,40%,55%)', fontSize: '0.68rem',
                      display: 'block', marginBottom: 3,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Cogni</span>
                    <BotTextWithLink text={botText} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '9px 14px 10px',
            borderTop: '1px solid hsl(222,30%,15%)',
            background: 'hsl(222,47%,7%)',
            flexShrink: 0,
          }}>
            <p style={{
              textAlign: 'center', margin: 0,
              fontSize: '0.67rem', color: 'hsl(215,20%,38%)',
              fontFamily: 'Inter, sans-serif',
            }}>
              {orbHint}
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        className="va-toggle"
        onClick={isOpen ? handleClose : handleOpen}
        style={{
          position: 'fixed', bottom: 24, right: 92, zIndex: 1001,
          width: 56, height: 56,
          background: isOpen
            ? 'hsl(222,47%,11%)'
            : 'linear-gradient(135deg, hsl(270,100%,60%) 0%, hsl(180,100%,50%) 100%)',
          border: isOpen ? '1px solid hsl(222,30%,22%)' : 'none',
          borderRadius: 16, cursor: 'pointer',
          color: isOpen ? 'hsl(215,20%,65%)' : 'hsl(222,47%,6%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isOpen
            ? '0 4px 16px -4px hsla(0,0%,0%,0.4)'
            : '0 8px 32px -8px hsla(0,0%,0%,0.5)',
          transition: 'all 0.25s ease',
          animation: !isOpen ? 'vaTogglePulse 2.8s ease-in-out infinite' : 'none',
        }}
        aria-label={isOpen ? 'Close voice agent' : 'Open voice agent'}
      >
        {isOpen ? <CloseIcon size={18} /> : <MicIcon size={22} />}
      </button>
    </>
  )
}
