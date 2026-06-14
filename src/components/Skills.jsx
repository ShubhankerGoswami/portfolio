import { useEffect, useRef } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'pm',
    title: 'Core PM Competencies',
    count: 14,
    accent: ['hsl(210,100%,56%)', 'hsl(240,80%,62%)'],
    glow: 'hsla(210,100%,56%,.18)',
    chipBg: 'hsla(210,60%,14%,.7)',
    chipBorder: 'hsla(210,60%,30%,.35)',
    chipHoverBorder: 'hsl(210,100%,56%)',
    chipColor: 'hsl(210,40%,85%)',
    featured: new Set(['0–1 Product Development', 'Product Vision & Strategy', 'Go-to-Market Strategy (GTM)', 'AI Coding – Claude Code']),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    skills: [
      'Product Vision & Strategy','Product Roadmapping','0–1 Product Development',
      'Go-to-Market Strategy (GTM)','Agile & Scrum Methodologies','MVP Launch & Product Iteration',
      'Sprint Planning & Execution','Stakeholder Management','Performance Metrics & KPIs',
      'Product Prototyping & Wireframing','Customer Discovery & Validation',
      'Cross-functional Team Leadership','JIRA & Azure DevOps','FIGMA & Miro',
    ],
    wide: true,
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    count: 18,
    accent: ['hsl(38,100%,60%)', 'hsl(22,100%,55%)'],
    glow: 'hsla(38,100%,55%,.18)',
    chipBg: 'hsla(38,50%,12%,.7)',
    chipBorder: 'hsla(38,60%,28%,.38)',
    chipHoverBorder: 'hsl(38,100%,60%)',
    chipColor: 'hsl(38,60%,88%)',
    featured: new Set(['Generative AI', 'AI Agents', 'RAG Systems', 'LLMs']),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z"/>
        <path d="M4 20a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4"/>
        <line x1="12" y1="10" x2="12" y2="14"/>
        <line x1="8" y1="14" x2="16" y2="14"/>
      </svg>
    ),
    skills: [
      'Generative AI','AI Agents','LLMs','RAG Systems',
      'Machine Learning','Speech Models (TTS & STT)','NLP',
      'AI Coding – Claude Code','OpenAI Codex',
      'Voice Agents','Knowledge Graphs','AI Bots','Vibe Coding',
      'Prompt Engineering','AI Evals','Multimodal AI',
      'Context Engineering','MCP (Model Context Protocol)',
    ],
    wide: false,
  },
  {
    id: 'tech',
    title: 'Technical Skills',
    count: 16,
    accent: ['hsl(180,90%,45%)', 'hsl(200,100%,52%)'],
    glow: 'hsla(180,90%,45%,.16)',
    chipBg: 'hsla(180,50%,10%,.7)',
    chipBorder: 'hsla(180,50%,26%,.35)',
    chipHoverBorder: 'hsl(180,90%,50%)',
    chipColor: 'hsl(180,40%,84%)',
    featured: new Set(['Python', 'React', 'JavaScript', 'Tableau']),
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    groups: [
      { label: 'Programming & Scripting', tags: ['HTML','CSS','JavaScript','React','Python','SQL'] },
      { label: 'Web & Systems',           tags: ['REST APIs','System Design','Databases'] },
      { label: 'Data & Analytics',        tags: ['Tableau','Data Analytics','MS Excel'] },
      { label: 'Digital Marketing',       tags: ['Google Ads','Google Analytics','Keyword Research','WordPress'] },
    ],
    wide: false,
  },
]

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, cat, index, featured }) {
  return (
    <span
      className={`sk-chip${featured ? ' sk-chip-featured' : ''}`}
      style={{
        '--cat-bg':           cat.chipBg,
        '--cat-border':       cat.chipBorder,
        '--cat-hover-border': cat.chipHoverBorder,
        '--cat-color':        cat.chipColor,
        '--cat-glow':         cat.glow,
        '--cat-accent':       cat.accent[0],
        animationDelay:       `${index * 52}ms`,
      }}
    >
      {label}
      {featured && <span className="sk-chip-star" aria-hidden="true" />}
    </span>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Skills() {
  const gridRef = useRef(null)

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.sk-card')
    if (!cards) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sk-visible')
          obs.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    cards.forEach(c => obs.observe(c))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="skills" className="section section-alt">
      <style>{`
        /* ── Keyframes ─────────────────────────────────────────────────────── */
        @keyframes sk-chip-in {
          from { opacity:0; transform: translateY(12px) scale(0.9); }
          to   { opacity:1; transform: none; }
        }
        @keyframes sk-card-in {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: none; }
        }
        @keyframes sk-border-flow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ── Grid ──────────────────────────────────────────────────────────── */
        .sk-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .sk-card-wide { grid-column: 1 / -1; }

        /* ── Card ──────────────────────────────────────────────────────────── */
        .sk-card {
          position: relative;
          background: hsla(222,42%,8%,.85);
          border-radius: 16px;
          border: 1px solid hsla(222,30%,16%,.7);
          overflow: hidden;
          transition: transform .25s ease, box-shadow .3s ease;
          /* hidden until visible */
          opacity: 0;
        }
        .sk-card.sk-visible {
          animation: sk-card-in .45s ease-out both;
        }
        .sk-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px -10px var(--card-glow, hsla(210,100%,56%,.18));
        }

        /* Animated gradient top accent bar */
        .sk-card::before {
          content: '';
          display: block;
          height: 3px;
          background: linear-gradient(90deg, var(--bar-c1), var(--bar-c2), var(--bar-c1));
          background-size: 200% 100%;
          animation: sk-border-flow 4s ease-in-out infinite;
        }

        /* ── Card header ───────────────────────────────────────────────────── */
        .sk-head {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 22px 14px;
        }
        .sk-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--icon-bg, hsla(210,60%,14%,.9));
          color: var(--icon-color, hsl(210,100%,65%));
          box-shadow: 0 0 12px var(--icon-glow, hsla(210,100%,56%,.25));
        }
        .sk-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700; font-size: .95rem;
          color: hsl(210,40%,95%); line-height: 1.2;
        }
        .sk-count {
          margin-left: auto; flex-shrink: 0;
          padding: 3px 10px; border-radius: 999px;
          background: hsla(222,30%,14%,.8);
          border: 1px solid hsla(222,30%,22%,.6);
          font-size: .65rem; font-weight: 600;
          color: hsl(215,20%,42%);
          font-family: 'Space Grotesk', sans-serif;
        }

        /* ── Chips wrapper ─────────────────────────────────────────────────── */
        .sk-chips {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 0 22px 22px;
        }

        /* ── Individual chip ───────────────────────────────────────────────── */
        .sk-chip {
          padding: 6px 13px; border-radius: 999px; cursor: default;
          font-size: .75rem; font-weight: 500;
          font-family: Inter, sans-serif;
          background: var(--cat-bg);
          border: 1px solid var(--cat-border);
          color: var(--cat-color);
          transition: all .18s ease;
          opacity: 0;             /* revealed by .sk-visible */
          position: relative;
        }
        .sk-card.sk-visible .sk-chip {
          animation: sk-chip-in .38s ease-out both;
        }
        .sk-chip:hover {
          border-color: var(--cat-hover-border);
          box-shadow: 0 0 14px var(--cat-glow);
          transform: translateY(-1px);
          color: #fff;
        }

        /* Featured chip — brighter treatment */
        .sk-chip-featured {
          border-color: var(--cat-accent) !important;
          background: color-mix(in srgb, var(--cat-bg) 70%, var(--cat-accent) 30%);
          font-weight: 600;
          color: #fff;
        }
        .sk-chip-featured:hover {
          box-shadow: 0 0 18px var(--cat-glow), 0 0 6px var(--cat-accent);
        }

        /* Star dot on featured */
        .sk-chip-star {
          display: inline-block; vertical-align: middle;
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--cat-accent);
          margin-left: 6px; margin-bottom: 1px;
          box-shadow: 0 0 5px var(--cat-accent);
        }

        /* ── Tech sub-groups ───────────────────────────────────────────────── */
        .sk-groups { padding: 0 22px 22px; display: flex; flex-direction: column; gap: 14px; }
        .sk-group-label {
          font-size: .62rem; font-weight: 700; letter-spacing: .09em;
          text-transform: uppercase; color: hsl(180,60%,45%);
          margin-bottom: 6px; font-family: 'Space Grotesk', sans-serif;
        }
        .sk-group-chips { display: flex; flex-wrap: wrap; gap: 7px; }

        /* ── Responsive ────────────────────────────────────────────────────── */
        @media (max-width: 720px) {
          .sk-grid { grid-template-columns: 1fr; }
          .sk-card-wide { grid-column: 1; }
        }
      `}</style>

      <div className="container">
        <div className="section-header">
          <h2>Skills & <span className="text-gradient-primary">Expertise</span></h2>
          <div className="section-line"></div>
        </div>

        <div className="sk-grid" ref={gridRef}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className={`sk-card${cat.wide ? ' sk-card-wide' : ''}`}
              style={{
                '--bar-c1':    cat.accent[0],
                '--bar-c2':    cat.accent[1],
                '--card-glow': cat.glow,
                '--icon-bg':   `color-mix(in srgb, ${cat.accent[0]} 15%, hsla(222,42%,8%,.9) 85%)`,
                '--icon-color':cat.accent[0],
                '--icon-glow': cat.glow,
              }}
            >
              {/* Header */}
              <div className="sk-head">
                <div className="sk-icon">{cat.icon}</div>
                <div className="sk-title">{cat.title}</div>
                <div className="sk-count">{cat.count} skills</div>
              </div>

              {/* Chips or grouped tech */}
              {cat.skills ? (
                <div className="sk-chips">
                  {cat.skills.map((skill, i) => (
                    <Chip
                      key={skill}
                      label={skill}
                      cat={cat}
                      index={i}
                      featured={cat.featured.has(skill)}
                    />
                  ))}
                </div>
              ) : (
                <div className="sk-groups">
                  {cat.groups.map((grp, gi) => (
                    <div key={grp.label}>
                      <div className="sk-group-label">{grp.label}</div>
                      <div className="sk-group-chips">
                        {grp.tags.map((tag, ti) => (
                          <Chip
                            key={tag}
                            label={tag}
                            cat={cat}
                            index={gi * 8 + ti}
                            featured={cat.featured.has(tag)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
