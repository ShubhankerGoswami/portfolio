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
        @keyframes orbPulse {
          0%, 100% { box-shadow: 0 0 0 0 hsla(270,80%,60%,0.5), 0 0 20px hsla(270,80%,55%,0.3); }
          50%       { box-shadow: 0 0 0 10px hsla(270,80%,60%,0), 0 0 32px hsla(270,80%,55%,0.5); }
        }
        @keyframes waveBar {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
        .resume-action-btn:hover {
          background: hsla(210,100%,56%,0.18) !important;
          border-color: hsl(210,100%,56%) !important;
          color: hsl(210,100%,72%) !important;
        }
        .resume-recruiter-card {
          display: flex; align-items: center; gap: 20px;
          max-width: 900px; margin: 0 auto 2rem;
          padding: 18px 24px;
          border-radius: 16px;
          background: hsla(270,40%,10%,0.7);
          border: 1px solid hsla(270,60%,45%,0.35);
          box-shadow: 0 0 40px -10px hsla(270,80%,55%,0.18);
          backdrop-filter: blur(12px);
          text-decoration: none;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .resume-recruiter-card:hover {
          border-color: hsla(270,70%,60%,0.6);
          box-shadow: 0 0 56px -8px hsla(270,80%,55%,0.32);
          transform: translateY(-2px);
        }
        .resume-recruiter-orb {
          flex-shrink: 0;
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, hsl(270,80%,38%) 0%, hsl(210,100%,45%) 100%);
          display: flex; align-items: center; justify-content: center;
          animation: orbPulse 2.4s ease-in-out infinite;
        }
        .resume-recruiter-wave {
          display: flex; align-items: center; gap: 3px;
        }
        .resume-recruiter-wave span {
          display: block; width: 3px; border-radius: 2px;
          background: rgba(255,255,255,0.85);
          transform-origin: bottom;
        }
        .resume-recruiter-wave span:nth-child(1) { height: 10px; animation: waveBar 1.1s ease-in-out infinite 0s; }
        .resume-recruiter-wave span:nth-child(2) { height: 18px; animation: waveBar 1.1s ease-in-out infinite 0.18s; }
        .resume-recruiter-wave span:nth-child(3) { height: 24px; animation: waveBar 1.1s ease-in-out infinite 0.36s; }
        .resume-recruiter-wave span:nth-child(4) { height: 18px; animation: waveBar 1.1s ease-in-out infinite 0.54s; }
        .resume-recruiter-wave span:nth-child(5) { height: 10px; animation: waveBar 1.1s ease-in-out infinite 0.72s; }
        .resume-recruiter-cta {
          flex-shrink: 0;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 9px;
          background: linear-gradient(135deg, hsl(270,80%,52%) 0%, hsl(210,100%,56%) 100%);
          color: #fff; font-size: 0.8rem; font-weight: 700;
          font-family: Inter, sans-serif; white-space: nowrap;
          box-shadow: 0 4px 18px hsla(270,80%,55%,0.35);
          transition: filter 0.18s, transform 0.18s;
        }
        .resume-recruiter-card:hover .resume-recruiter-cta {
          filter: brightness(1.12); transform: translateX(2px);
        }
        @media (max-width: 600px) {
          .resume-recruiter-card { flex-wrap: wrap; gap: 14px; }
          .resume-recruiter-cta { width: 100%; justify-content: center; }
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

      {/* Recruiter CTA */}
      <section style={{ padding: '0 1rem' }}>
        <a href="/recruiter" className="resume-recruiter-card">
          <div className="resume-recruiter-orb">
            <div className="resume-recruiter-wave">
              <span /><span /><span /><span /><span />
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: 'hsl(210,40%,94%)', marginBottom: 4,
            }}>
              Are you a recruiter?
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
              color: 'hsl(270,30%,65%)', lineHeight: 1.5,
            }}>
              Skip the reading — talk to Cogni, my AI voice agent, and ask anything about my experience, skills, or availability.
            </div>
          </div>
          <div className="resume-recruiter-cta">
            Talk to Cogni
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </a>
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
