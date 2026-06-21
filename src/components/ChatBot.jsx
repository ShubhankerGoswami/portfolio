import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL =
  window.location.host.split(':')[0] === 'localhost'
    ? 'ws://localhost:10000/ws'
    : 'wss://portfoliobackend-q666.onrender.com/ws'

const STORAGE_KEY = 'message1Closed'

const BotIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
    <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
  </svg>
)

const SendIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2z" />
  </svg>
)

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
)

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '10px 14px',
      background: 'hsl(222, 47%, 12%)',
      borderRadius: '14px 14px 14px 2px',
      border: '1px solid hsl(222, 30%, 20%)',
      width: 'fit-content',
    }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'block',
          width: 7, height: 7, borderRadius: '50%',
          background: 'hsl(210, 100%, 56%)',
          animation: 'cbTypingDot 1.3s ease-in-out infinite',
          animationDelay: `${i * 0.18}s`,
        }} />
      ))}
    </div>
  )
}

export default function ChatBot() {
  const [popupVisible, setPopupVisible] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hey 👋 I'm Shubhanker's AI Assistant. I can answer questions about his work, skills, and experience. How can I help you?" },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const closed = sessionStorage.getItem(STORAGE_KEY)
    if (!closed) setTimeout(() => setPopupVisible(true), 2500)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (chatOpen) setTimeout(() => textareaRef.current?.focus(), 150)
  }, [chatOpen])

  const openSocket = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return
    const ws = new WebSocket(WS_URL)
    ws.onopen = () => console.log('WebSocket connected')
    ws.onmessage = (event) => {
      setIsTyping(false)
      setMessages(prev => [...prev, { from: 'bot', text: event.data }])
    }
    ws.onerror = (err) => {
      console.error('WebSocket error', err)
      setIsTyping(false)
    }
    socketRef.current = ws
  }, [])

  const closeSocket = useCallback(() => {
    socketRef.current?.close()
    socketRef.current = null
  }, [])

  useEffect(() => {
    const handler = () => {
      setPopupVisible(false)
      setChatOpen(true)
      sessionStorage.setItem(STORAGE_KEY, 'true')
      openSocket()
    }
    window.addEventListener('openChatbot', handler)
    return () => window.removeEventListener('openChatbot', handler)
  }, [openSocket])

  const handleStartChat = () => {
    setPopupVisible(false)
    setChatOpen(true)
    sessionStorage.setItem(STORAGE_KEY, 'true')
    openSocket()
  }

  const handleClosePopup = () => {
    setPopupVisible(false)
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleCloseChat = () => {
    setChatOpen(false)
    closeSocket()
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    setIsTyping(true)
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(text)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px'
  }

  const botAvatar = (
    <div style={{
      width: 28, height: 28, flexShrink: 0,
      background: 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)',
      borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'hsl(222,47%,6%)',
    }}>
      <BotIcon size={14} />
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes cbTypingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes cbSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes cbPopIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes cbPulse {
          0%, 100% { box-shadow: 0 0 0 0 hsla(210,100%,56%,0.45), 0 8px 32px -8px hsla(0,0%,0%,0.5); }
          50%       { box-shadow: 0 0 0 9px hsla(210,100%,56%,0),  0 8px 32px -8px hsla(0,0%,0%,0.5); }
        }
        .cb-toggle:hover { transform: scale(1.08) !important; filter: brightness(1.12); }
        .cb-close-btn:hover { background: hsla(0,60%,50%,0.2) !important; color: hsl(0,80%,72%) !important; }
        .cb-send:hover:not(:disabled) { filter: brightness(1.15); }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-track { background: transparent; }
        .cb-messages::-webkit-scrollbar-thumb { background: hsl(222,30%,24%); border-radius: 4px; }
        .cb-textarea { scrollbar-width: none; }
        .cb-textarea::-webkit-scrollbar { display: none; }
        .cb-input-wrap:focus-within {
          border-color: hsl(210,100%,56%) !important;
          box-shadow: 0 0 0 3px hsla(210,100%,56%,0.12) !important;
        }
      `}</style>

      {/* ── Popup ── */}
      {popupVisible && !chatOpen && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 1001,
          animation: 'cbPopIn 0.28s ease-out',
        }}>
          <div style={{
            background: 'hsl(222,47%,9%)',
            border: '1px solid hsl(222,30%,22%)',
            borderRadius: '14px 14px 2px 14px',
            padding: '14px 16px 14px',
            width: 220,
            boxShadow: '0 12px 40px -8px hsla(0,0%,0%,0.55), 0 0 0 1px hsla(210,100%,56%,0.1)',
            position: 'relative',
          }}>
            <button
              onClick={handleClosePopup}
              className="cb-close-btn"
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'hsla(222,30%,20%,0.8)',
                border: 'none', cursor: 'pointer',
                color: 'hsl(215,20%,55%)', padding: '3px',
                borderRadius: 6, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              <CloseIcon size={13} />
            </button>
            <p style={{
              color: 'hsl(210,40%,90%)', fontSize: '0.82rem',
              fontFamily: 'Inter, sans-serif', lineHeight: 1.55,
              margin: 0, paddingRight: 18,
            }}>
              Hey 👋 I'm Shubhanker's AI Assistant. Got questions? Let me help!
            </p>
            <button
              onClick={handleStartChat}
              style={{
                marginTop: 12, width: '100%',
                background: 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)',
                color: 'hsl(222,47%,6%)', border: 'none',
                borderRadius: 8, padding: '7px 0',
                fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'filter 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              Start Chat →
            </button>
          </div>
        </div>
      )}

      {/* ── Chat window ── */}
      {chatOpen && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 1001,
          width: 370, height: 530,
          display: 'flex', flexDirection: 'column',
          background: 'hsl(222,47%,8%)',
          border: '1px solid hsl(222,30%,17%)',
          borderRadius: 18,
          boxShadow: '0 28px 72px -12px hsla(0,0%,0%,0.65), 0 0 0 1px hsla(210,100%,56%,0.07)',
          animation: 'cbSlideUp 0.25s ease-out',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 14px',
            background: 'linear-gradient(135deg, hsl(222,47%,11%) 0%, hsl(230,40%,13%) 100%)',
            borderBottom: '1px solid hsl(222,30%,17%)',
            flexShrink: 0,
          }}>
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)',
              borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(222,47%,6%)',
            }}>
              <BotIcon size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600, fontSize: '0.95rem',
                color: 'hsl(210,40%,98%)',
                lineHeight: 1.2,
              }}>
                Shubhanker's AI Assistant
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{
                  display: 'block', width: 7, height: 7, borderRadius: '50%',
                  background: 'hsl(142,70%,45%)',
                  boxShadow: '0 0 6px hsl(142,70%,45%)',
                }} />
                <span style={{
                  fontSize: '0.72rem', color: 'hsl(215,20%,60%)',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  Online · Ask me anything
                </span>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="cb-close-btn"
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

          {/* Messages */}
          <div
            className="cb-messages"
            style={{
              flex: 1, overflowY: 'auto',
              padding: '14px 14px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 8,
              }}>
                {msg.from === 'bot' && botAvatar}
                <div style={{
                  maxWidth: '78%',
                  padding: '9px 13px',
                  borderRadius: msg.from === 'user'
                    ? '14px 14px 3px 14px'
                    : '14px 14px 14px 3px',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)'
                    : 'hsl(222,47%,12%)',
                  color: msg.from === 'user'
                    ? 'hsl(222,47%,6%)'
                    : 'hsl(210,40%,92%)',
                  border: msg.from === 'user'
                    ? 'none'
                    : '1px solid hsl(222,30%,20%)',
                  fontSize: '0.86rem',
                  lineHeight: 1.6,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: msg.from === 'user' ? 500 : 400,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                {botAvatar}
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: '10px 12px 12px',
            borderTop: '1px solid hsl(222,30%,15%)',
            background: 'hsl(222,47%,7%)',
            flexShrink: 0,
          }}>
            <div
              className="cb-input-wrap"
              style={{
                display: 'flex', gap: 8,
                background: 'hsl(222,47%,11%)',
                border: '1px solid hsl(222,30%,20%)',
                borderRadius: 13,
                padding: '8px 8px 8px 13px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <textarea
                ref={textareaRef}
                className="cb-textarea"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleTextareaInput}
                placeholder="Ask me anything…"
                rows={1}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  resize: 'none', overflow: 'hidden',
                  color: 'hsl(210,40%,92%)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  caretColor: 'hsl(210,100%,56%)',
                  maxHeight: 110,
                }}
              />
              <button
                className="cb-send"
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 34, height: 34, flexShrink: 0,
                  background: input.trim()
                    ? 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)'
                    : 'hsl(222,30%,17%)',
                  border: 'none', borderRadius: 9,
                  cursor: input.trim() ? 'pointer' : 'default',
                  color: input.trim() ? 'hsl(222,47%,6%)' : 'hsl(215,20%,40%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <SendIcon />
              </button>
            </div>
            <p style={{
              textAlign: 'center', marginTop: 7,
              fontSize: '0.67rem', color: 'hsl(215,20%,38%)',
              fontFamily: 'Inter, sans-serif',
            }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle button ── */}
      <button
        className="cb-toggle"
        onClick={chatOpen ? handleCloseChat : handleStartChat}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1001,
          width: 56, height: 56,
          background: chatOpen
            ? 'hsl(222,47%,11%)'
            : 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)',
          border: chatOpen ? '1px solid hsl(222,30%,22%)' : 'none',
          borderRadius: 16,
          cursor: 'pointer',
          color: chatOpen ? 'hsl(215,20%,65%)' : 'hsl(222,47%,6%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: chatOpen
            ? '0 4px 16px -4px hsla(0,0%,0%,0.4)'
            : '0 8px 32px -8px hsla(0,0%,0%,0.5)',
          transition: 'all 0.25s ease',
          animation: !chatOpen ? 'cbPulse 2.8s ease-in-out infinite' : 'none',
        }}
        aria-label={chatOpen ? 'Close chat' : 'Open chat'}
      >
        {chatOpen ? <CloseIcon size={18} /> : <ChatIcon />}
      </button>
    </>
  )
}