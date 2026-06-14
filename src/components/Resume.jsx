import PDFViewer from './PDFViewer'

export default function Resume() {
  return (
    <>
      <style>{`
        @keyframes resumeFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes resumeHeroFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .resume-action-btn:hover {
          background: hsla(210,100%,56%,0.18) !important;
          border-color: hsl(210,100%,56%) !important;
          color: hsl(210,100%,72%) !important;
        }
      `}</style>

      {/* Hero banner */}
      <section style={{
        minHeight: '32vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '7rem 1rem 3rem',
        background: 'radial-gradient(ellipse at 50% 0%, hsla(210,100%,56%,0.12) 0%, transparent 65%)',
      }}>
        {/* Blobs */}
        <div style={{
          position: 'absolute', top: '3rem', left: '5%',
          width: '22rem', height: '22rem', borderRadius: '50%',
          background: 'hsla(210,100%,56%,0.07)', filter: 'blur(80px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '1rem', right: '5%',
          width: '18rem', height: '18rem', borderRadius: '50%',
          background: 'hsla(260,100%,65%,0.06)', filter: 'blur(70px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', textAlign: 'center',
          animation: 'resumeHeroFade 0.6s ease-out',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 16px', borderRadius: 999,
            border: '1px solid hsla(222,30%,18%,0.6)',
            background: 'hsla(222,47%,9%,0.6)',
            backdropFilter: 'blur(12px)',
            fontSize: '0.8rem', color: 'hsl(215,20%,65%)',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '1.25rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(210,100%,56%)', display: 'block' }} />
            Shubhanker Goswami · AI Product Manager
          </span>

          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.2rem,7vw,3.8rem)',
            fontWeight: 700, lineHeight: 1.1,
            marginBottom: '1rem',
          }}>
            My{' '}
            <span style={{
              background: 'linear-gradient(135deg, hsl(210,100%,56%) 0%, hsl(260,100%,65%) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Resume
            </span>
          </h1>
          <p style={{
            maxWidth: '36rem', margin: '0 auto 1.75rem',
            fontSize: '1.05rem', color: 'hsl(215,20%,65%)',
            lineHeight: 1.7, fontFamily: 'Inter, sans-serif',
          }}>
            4+ years building AI products across Enterprise AI, SAAS, Data Infrastructure, and EdTech platforms.
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/img/resume.pdf"
              download="Shubhanker_Goswami_Resume.pdf"
              className="resume-action-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10,
                border: '1px solid hsla(210,100%,56%,0.4)',
                background: 'hsla(210,100%,56%,0.1)',
                color: 'hsl(210,100%,65%)',
                fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </a>
            <a
              href="/img/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="resume-action-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 10,
                border: '1px solid hsl(222,30%,22%)',
                background: 'hsl(222,47%,9%)',
                color: 'hsl(215,20%,65%)',
                fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', fontWeight: 600,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open in new tab
            </a>
          </div>
        </div>
      </section>

      {/* PDF viewer */}
      <section style={{ padding: '1rem 1rem 6rem' }}>
        <div style={{
          maxWidth: 900, margin: '0 auto', padding: '0 1rem',
          animation: 'resumeFadeUp 0.6s ease-out 0.15s both',
        }}>
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid hsl(222,30%,18%)',
            boxShadow: '0 8px 48px -8px hsla(210,100%,56%,0.2), 0 4px 24px -4px hsla(0,0%,0%,0.4)',
            background: 'hsl(222,47%,9%)',
            minHeight: 600,
          }}>
            <PDFViewer src="/img/resume.pdf" />
          </div>

          <p style={{
            textAlign: 'center', marginTop: '1.25rem',
            fontSize: '0.8rem', color: 'hsl(215,20%,45%)',
            fontFamily: 'Inter, sans-serif',
          }}>
            Use the Download button above to save a copy
          </p>
        </div>
      </section>
    </>
  )
}
