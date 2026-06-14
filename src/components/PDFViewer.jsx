/**
 * PDFViewer — renders a PDF with PDF.js (canvas + text layer).
 * Accepts a `highlightTerms` array; when it changes, matching text-layer
 * spans get a gold glow highlight and the view auto-scrolls to the first hit.
 */
import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const HL = 'pdfv-hl'   // highlight CSS class name

export default function PDFViewer({ src = '/img/resume.pdf', highlightTerms = [] }) {
  const containerRef = useRef(null)
  const [status, setStatus]   = useState('loading') // loading | ready | error

  // ── Render all PDF pages once on mount ──────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    if (!container) return

    async function renderAll() {
      try {
        const pdf = await pdfjsLib.getDocument(src).promise
        for (let p = 1; p <= pdf.numPages; p++) {
          if (cancelled) return

          const page = await pdf.getPage(p)
          // Scale to fit container width minus padding (no horizontal scroll)
          const naturalVp = page.getViewport({ scale: 1.0 })
          const availWidth = container.clientWidth - 2   // 1px border each side
          const scale = availWidth / naturalVp.width
          const vp   = page.getViewport({ scale })

          // Page wrapper
          const wrap = document.createElement('div')
          wrap.style.cssText = [
            `position:relative`,
            `width:${vp.width}px`,
            `height:${vp.height}px`,
            `margin:0 auto 10px`,
            `box-shadow:0 4px 24px rgba(0,0,0,.5)`,
          ].join(';')

          // Canvas — visible PDF rendering
          const canvas    = document.createElement('canvas')
          canvas.width    = vp.width
          canvas.height   = vp.height
          canvas.style.cssText = 'position:absolute;inset:0;display:block;'
          wrap.appendChild(canvas)
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise

          // Text layer — invisible spans positioned over canvas for highlighting
          const tl = document.createElement('div')
          tl.className    = 'pdfv-tl'
          tl.style.cssText = 'position:absolute;inset:0;overflow:hidden;'
          wrap.appendChild(tl)

          const tc   = await page.getTextContent()
          const task = pdfjsLib.renderTextLayer({
            textContent : tc,
            container   : tl,
            viewport    : vp,
            textDivs    : [],
          })
          await (task.promise ?? task)   // 3.x returns { promise }, 4.x may differ

          if (!cancelled) container.appendChild(wrap)
        }
        if (!cancelled) setStatus('ready')
      } catch (err) {
        console.error('[PDFViewer]', err)
        if (!cancelled) setStatus('error')
      }
    }

    renderAll()
    return () => { cancelled = true }
  }, [src])

  // ── Apply / clear highlights whenever highlightTerms changes ────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous highlights (inline styles — bypasses PDF.js CSS conflicts)
    container.querySelectorAll(`.${HL}`).forEach(el => {
      el.classList.remove(HL)
      el.style.background    = ''
      el.style.borderRadius  = ''
      el.style.boxShadow     = ''
      el.style.animation     = ''
    })
    if (!highlightTerms.length) return

    const termWords = highlightTerms
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length >= 4)

    if (!termWords.length) return

    // Query all spans — container holds only PDF page wrappers so all spans are text-layer spans
    const spans = container.querySelectorAll('span')
    console.debug('[PDFViewer] highlight search — terms:', termWords, '| spans found:', spans.length)

    let firstHit = null
    spans.forEach(span => {
      const raw = span.textContent ?? ''
      const s   = raw.trim().toLowerCase()
      if (s.length < 3) return

      const hit = termWords.some(t =>
        s === t || s.includes(t) || t.includes(s)
      )

      if (hit) {
        span.classList.add(HL)
        // Apply via inline styles so PDF.js's own stylesheet cannot override
        span.style.background   = 'rgba(255, 213, 0, 0.45)'
        span.style.borderRadius = '3px'
        span.style.boxShadow    = '0 0 10px rgba(255, 200, 0, 0.70)'
        if (!firstHit) firstHit = span
      }
    })

    console.debug('[PDFViewer] hits found:', container.querySelectorAll(`.${HL}`).length)
    firstHit?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightTerms])

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'auto', background: 'hsl(222,47%,5%)' }}>
      <style>{`
        /* Text layer spans — invisible over canvas, revealed by highlight class */
        .pdfv-tl span {
          color: transparent;
          position: absolute;
          white-space: pre;
          transform-origin: 0% 0%;
          cursor: text;
        }

        /* Highlight applied via inline styles in JS to override PDF.js stylesheet */
        @keyframes pdfSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Loading state */}
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, color: 'hsl(210,100%,70%)',
          pointerEvents: 'none',
        }}>
          <svg
            width="36" height="36" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'pdfSpin 1s linear infinite' }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span style={{ fontSize: '.82rem', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Loading resume…
          </span>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'hsl(0,60%,55%)', fontSize: '.8rem', fontFamily: 'Inter, sans-serif',
        }}>
          Failed to load resume PDF
        </div>
      )}

      {/* Pages rendered here by renderAll() */}
      <div ref={containerRef} style={{ padding: '16px 0' }} />
    </div>
  )
}
