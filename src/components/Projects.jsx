import { useState } from 'react'

// ── Icons ────────────────────────────────────────────────────────────────────

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const GithubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const TrendingUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

// ── Data ─────────────────────────────────────────────────────────────────────

const projects = [
  {
    id: 1,
    title: 'Insight 360',
    tagline: 'Enterprise RAG & AI Agents Platform · 0 → 1',
    category: 'AI / ML Platform',
    status: 'Live',
    statusColor: 'green',
    year: '2022 – Present',
    company: 'Smartsense Consulting Solutions',
    role: 'AI Product Manager (Lead)',
    description:
      'Launched an enterprise RAG platform in 3 months, scaling to 100+ DAU during early adoption. Built AI agent-based architecture for intent-driven external data retrieval and designed a multimodal document intelligence pipeline (OCR + layout parsing + embeddings + retrieval) enabling multi-format knowledge access across 5+ enterprise clients.',
    highlights: [
      'Improved RAG retrieval accuracy by ~70% via hybrid search (semantic + keyword-based retrieval)',
      'Reduced manual document effort by ~90% through improved enterprise knowledge retrieval workflows',
      'Optimized architecture using open-source Models & LLMs, reducing dependency on paid APIs',
      'Led 20-member cross-functional team across engineering, design, and QA to deliver MVP under tight timelines',
      'Crafted product narrative and investment pitch, securing internal funding and enabling enterprise sales',
      'Earned recognition in internal & client evaluations as a leading open-source, RAG-enabled solution',
    ],
    metrics: [
      { icon: <UsersIcon />, value: '100+ DAU', label: 'At launch' },
      { icon: <TrendingUpIcon />, value: '~70% accuracy', label: 'Retrieval improvement' },
      { icon: <UsersIcon />, value: '5+ clients', label: 'Enterprise onboarded' },
      { icon: <TrendingUpIcon />, value: '3 months', label: 'MVP delivery' },
    ],
    tags: ['RAG', 'AI Agents', 'LLM', 'Document Intelligence', 'Open-source', 'Enterprise'],
    links: { live: null, github: null, caseStudy: null },
  },
  {
    id: 2,
    title: 'Ostrich AI',
    tagline: 'Decentralized AI Infrastructure Platform · 0 → 1',
    category: 'AI Product',
    status: 'Live',
    statusColor: 'green',
    year: '2022 – Present',
    company: 'Smartsense Consulting Solutions',
    role: 'AI Product Manager (Lead)',
    description:
      'Architected and launched a decentralized AI infrastructure platform integrating blockchain-based data security with distributed compute nodes, enabling secure AI/ML model deployment while reducing infrastructure costs by up to 70% vs. traditional cloud providers. Owned end-to-end product vision, strategy, roadmap, and GTM.',
    highlights: [
      'Reduced infrastructure costs by up to 70% vs. traditional cloud providers using decentralized compute',
      'Onboarded ICICI Bank & Abu Dhabi Bank during MVP phase for enterprise Pilot',
      'Led 12+ member cross-functional team including PMs, engineers, designers, and QA under aggressive timelines',
      'Conducted user research and market analysis to identify unmet needs and define product-market fit',
      'Designed end-to-end user journeys, wireframes, Agile Sprints, and prioritization frameworks',
    ],
    metrics: [
      { icon: <TrendingUpIcon />, value: 'Up to 70%', label: 'Cost reduction vs cloud' },
      { icon: <UsersIcon />, value: '2 Banks', label: 'ICICI & Abu Dhabi (MVP)' },
      { icon: <UsersIcon />, value: '12+ team', label: 'Cross-functional' },
    ],
    tags: ['AI', 'Blockchain', 'Decentralized', 'Enterprise', '0→1 Product', 'GTM', 'MVP'],
    links: { live: null, github: null, caseStudy: null },
  },
  {
    id: 3,
    title: 'Second Brain AI',
    tagline: 'Insurance Fraud Detection & Claims AI · 0 → 1',
    category: 'AI Product',
    status: 'In Progress',
    statusColor: 'yellow',
    year: '2024 – Present',
    company: 'Smartsense Consulting Solutions',
    role: 'AI Product Manager (Lead)',
    description:
      'Driving 0→1 development of an AI-powered fraud detection platform leveraging RAG AI, Machine Learning, and Knowledge Graphs to identify anomalies in insurance claims. Building a document intelligence system for automated claims processing and a plug-and-play AI chatbot for MS Teams and Slack.',
    highlights: [
      'Targeting ~90% reduction in manual intervention through automated document intelligence for insurance claims',
      'Developing plug-and-play AI chatbot for employee policy & claims queries integrated into MS Teams and Slack',
      'Leveraging AI-assisted development (Claude Code) to build core modules, accelerating MVP timelines',
      'Executing GTM via LinkedIn-led outreach and an AI-driven prospecting agent to automate ICP targeting',
      'Shaping product positioning through competitive analysis of insurance fraud detection solutions',
    ],
    metrics: [
      { icon: <TrendingUpIcon />, value: '~90% reduction', label: 'Manual intervention target' },
      { icon: <UsersIcon />, value: 'MS Teams + Slack', label: 'Integration channels' },
    ],
    tags: ['Insurance', 'Fraud Detection', 'RAG', 'Knowledge Graphs', 'ML', 'AI Chatbot', '0→1 Product'],
    links: { live: null, github: null, caseStudy: null },
  },
  {
    id: 4,
    title: 'AI Automation & PoCs',
    tagline: 'CRM Automation · Lead Gen · AI Voice Assistant',
    category: 'AI Automation',
    status: 'Completed',
    statusColor: 'blue',
    year: '2023 – Present',
    company: 'Smartsense Consulting Solutions',
    role: 'AI Product Manager',
    description:
      'Built a suite of AI automation tools and proof-of-concepts — including an n8n + GPT CRM pipeline that cut manual effort by ~40%, an LLM-based lead generation system for prospect qualification, and an AI voice assistant PoC for inbound call handling that enabled successful client onboarding.',
    highlights: [
      'Built AI-driven CRM automation pipeline (n8n + GPT), reducing manual effort by ~40%',
      'Developed LLM-based lead generation system to identify and qualify prospects at scale',
      'Conceptualized and prototyped AI voice assistant for inbound calls, enabling successful client onboarding during PoC stage',
    ],
    metrics: [
      { icon: <TrendingUpIcon />, value: '~40% reduction', label: 'Manual CRM effort' },
      { icon: <UsersIcon />, value: '3 PoCs', label: 'Built & validated' },
    ],
    tags: ['AI Automation', 'n8n', 'GPT', 'LLM', 'CRM', 'Voice AI', 'Lead Generation'],
    links: { live: null, github: null, caseStudy: null },
  },
  {
    id: 5,
    title: 'FOSTER',
    tagline: 'Multi-sided Academic–Industry Networking Platform · 0 → 1',
    category: 'EdTech / SaaS',
    status: 'Live',
    statusColor: 'green',
    year: '2022 – Present',
    company: 'Smartsense Consulting Solutions',
    role: 'Product Manager',
    description:
      'Contributed to building a multi-sided networking platform connecting colleges, students, and employers across India. Drove product direction and execution, supporting onboarding of 10,000+ colleges and 100+ employers within the first year while defining market entry strategy and release roadmap.',
    highlights: [
      'Drove product direction supporting onboarding of 10,000+ colleges and 100+ employers within the first year',
      'Defined market entry strategy, feature prioritization, and release roadmap to drive B2B platform adoption',
      'Leveraged user insights and performance data to continuously refine product strategy and improve engagement',
      'Collaborated with leadership on pricing strategy and long-term roadmap, influencing revenue and retention',
    ],
    metrics: [
      { icon: <UsersIcon />, value: '10,000+ Colleges', label: 'Onboarded' },
      { icon: <TrendingUpIcon />, value: '100+ Employers', label: 'First year' },
    ],
    tags: ['EdTech', 'SaaS', 'B2B2C', 'Networking', '0→1 Product', 'GTM'],
    links: { live: null, github: null, caseStudy: null },
  },
  {
    id: 6,
    title: 'Railway Electrification',
    tagline: '572 km Large-Scale Infrastructure Programme',
    category: 'Infrastructure / EPC',
    status: 'Completed',
    statusColor: 'blue',
    year: '2017 – 2019',
    company: 'Green Power International',
    role: 'Engineer',
    description:
      'Supported end-to-end project management for a 572 km railway electrification project including site execution and vendor coordination. Handled procurement, ERP-based planning, and manpower management — gaining early exposure to structured project delivery in EPC environments.',
    highlights: [
      'Assisted in end-to-end project management for 572 km railway electrification including site execution and vendor coordination',
      'Supported procurement, ERP-based planning, and manpower management, ensuring timely project delivery',
      'Worked directly with senior leadership on planning and billing activities',
    ],
    metrics: [
      { icon: <TrendingUpIcon />, value: '572 km', label: 'Project scale' },
    ],
    tags: ['Infrastructure', 'EPC', 'Procurement', 'ERP', 'Project Management'],
    links: { live: null, github: null, caseStudy: null },
  },
]

const allCategories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]

const statusColors = {
  green:  { bg: 'hsla(142,70%,45%,0.12)', text: 'hsl(142,65%,50%)', dot: 'hsl(142,70%,45%)' },
  blue:   { bg: 'hsla(210,100%,56%,0.12)', text: 'hsl(210,100%,65%)', dot: 'hsl(210,100%,56%)' },
  yellow: { bg: 'hsla(45,93%,58%,0.12)', text: 'hsl(45,93%,62%)', dot: 'hsl(45,93%,58%)' },
}

// ── ProjectCard ───────────────────────────────────────────────────────────────

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false)
  const sc = statusColors[project.statusColor]

  return (
    <article
      className="glass-card"
      style={{
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        transition: 'border-color 0.3s ease, transform 0.3s ease',
        animation: `projectFadeUp 0.5s ease-out both`,
        animationDelay: `${index * 0.07}s`,
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'hsla(210,100%,56%,0.35)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = ''
        e.currentTarget.style.transform = ''
      }}
    >
      {/* Top row: category badge + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'hsl(210,100%,65%)',
          background: 'hsla(210,100%,56%,0.1)',
          padding: '3px 10px', borderRadius: 999,
          fontFamily: 'Inter, sans-serif',
        }}>
          {project.category}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: '0.72rem', fontWeight: 500,
          color: sc.text, background: sc.bg,
          padding: '3px 10px', borderRadius: 999,
          fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'block' }} />
          {project.status}
        </span>
      </div>

      {/* Title & tagline */}
      <div>
        <h3 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '1.25rem', fontWeight: 700,
          color: 'hsl(210,40%,98%)', marginBottom: 4,
          lineHeight: 1.25,
        }}>
          {project.title}
        </h3>
        <p style={{
          fontSize: '0.82rem', color: 'hsl(215,20%,60%)',
          fontFamily: 'Inter, sans-serif',
        }}>
          {project.tagline}
        </p>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'hsl(215,20%,55%)', fontFamily: 'Inter, sans-serif' }}>
          🏢 {project.company}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'hsl(215,20%,55%)', fontFamily: 'Inter, sans-serif' }}>
          🗓 {project.year}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'hsl(45,93%,58%)', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
          {project.role}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: '0.875rem', color: 'hsl(215,20%,72%)',
        lineHeight: 1.7, fontFamily: 'Inter, sans-serif',
      }}>
        {project.description}
      </p>

      {/* Metrics */}
      {project.metrics.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {project.metrics.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'hsla(222,30%,14%,0.7)',
              border: '1px solid hsl(222,30%,20%)',
              borderRadius: 10, padding: '8px 14px',
            }}>
              <span style={{ color: 'hsl(210,100%,56%)' }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(210,40%,96%)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.67rem', color: 'hsl(215,20%,55%)', fontFamily: 'Inter, sans-serif' }}>
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Highlights (collapsible) */}
      <div>
        <button
          onClick={() => setExpanded(x => !x)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'hsl(210,100%,65%)', fontSize: '0.82rem',
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            padding: 0, marginBottom: expanded ? '0.75rem' : 0,
            transition: 'color 0.2s',
          }}
        >
          <span style={{
            display: 'inline-block',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
            fontSize: '0.75rem',
          }}>▶</span>
          {expanded ? 'Hide highlights' : 'Show key highlights'}
        </button>

        {expanded && (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', margin: 0, padding: 0, listStyle: 'none' }}>
            {project.highlights.map((h, i) => (
              <li key={i} style={{
                display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                fontSize: '0.85rem', color: 'hsl(215,20%,72%)',
                lineHeight: 1.6, fontFamily: 'Inter, sans-serif',
              }}>
                <span style={{
                  flexShrink: 0, marginTop: 3,
                  color: 'hsl(210,100%,56%)',
                  background: 'hsla(210,100%,56%,0.1)',
                  borderRadius: '50%', padding: 2,
                  display: 'flex', alignItems: 'center',
                }}>
                  <CheckIcon />
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {project.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '0.72rem', padding: '3px 10px',
            background: 'hsl(222,30%,14%)',
            border: '1px solid hsl(222,30%,20%)',
            borderRadius: 6, color: 'hsl(215,20%,65%)',
            fontFamily: 'Inter, sans-serif',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Links */}
      {(project.links.live || project.links.github || project.links.caseStudy) && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: 4, borderTop: '1px solid hsl(222,30%,18%)' }}>
          {project.links.live && (
            <a href={project.links.live} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.8rem', color: 'hsl(210,100%,65%)',
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              textDecoration: 'none',
            }}>
              <ExternalLinkIcon /> Live Demo
            </a>
          )}
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.8rem', color: 'hsl(215,20%,65%)',
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              textDecoration: 'none',
            }}>
              <GithubIcon /> GitHub
            </a>
          )}
          {project.links.caseStudy && (
            <a href={project.links.caseStudy} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.8rem', color: 'hsl(45,93%,62%)',
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              textDecoration: 'none',
            }}>
              <ExternalLinkIcon /> Case Study
            </a>
          )}
        </div>
      )}
    </article>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory)

  return (
    <>
      <style>{`
        @keyframes projectFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes projectHeroFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .filter-btn:hover {
          border-color: hsl(210,100%,56%) !important;
          color: hsl(210,100%,65%) !important;
        }
      `}</style>

      {/* Hero banner */}
      <section style={{
        minHeight: '38vh',
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
          animation: 'projectHeroFade 0.6s ease-out',
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
            Portfolio · {projects.length} Projects
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
              Projects
            </span>
          </h1>
          <p style={{
            maxWidth: '36rem', margin: '0 auto',
            fontSize: '1.05rem', color: 'hsl(215,20%,65%)',
            lineHeight: 1.7, fontFamily: 'Inter, sans-serif',
          }}>
            A curated collection of products I've built, led, or contributed to —
            spanning AI platforms, enterprise SaaS, and large-scale infrastructure.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ padding: '0 1rem 0.5rem' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 2rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.8rem', color: 'hsl(215,20%,55%)',
            fontFamily: 'Inter, sans-serif', marginRight: 4,
          }}>
            <FilterIcon /> Filter:
          </span>
          {allCategories.map(cat => (
            <button
              key={cat}
              className="filter-btn"
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 14px', borderRadius: 8,
                fontSize: '0.8rem', fontFamily: 'Inter, sans-serif',
                fontWeight: 500, cursor: 'pointer',
                border: `1px solid ${activeCategory === cat ? 'hsl(210,100%,56%)' : 'hsl(222,30%,20%)'}`,
                background: activeCategory === cat ? 'hsla(210,100%,56%,0.12)' : 'hsl(222,47%,9%)',
                color: activeCategory === cat ? 'hsl(210,100%,65%)' : 'hsl(215,20%,60%)',
                transition: 'all 0.2s',
              }}
            >
              {cat}
              {cat === 'All' && (
                <span style={{
                  marginLeft: 6, fontSize: '0.68rem',
                  background: 'hsla(210,100%,56%,0.2)',
                  color: 'hsl(210,100%,70%)',
                  padding: '1px 6px', borderRadius: 999,
                }}>
                  {projects.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Projects grid */}
      <section style={{ padding: '2rem 1rem 6rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'hsl(215,20%,55%)', fontFamily: 'Inter, sans-serif' }}>
              No projects in this category yet.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))',
              gap: '1.5rem',
            }}>
              {filtered.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{
            marginTop: '4rem', textAlign: 'center',
            padding: '2.5rem',
            background: 'hsla(222,47%,9%,0.6)',
            border: '1px solid hsl(222,30%,18%)',
            borderRadius: 16,
            backdropFilter: 'blur(20px)',
          }}>
            <h3 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.3rem', fontWeight: 600,
              color: 'hsl(210,40%,98%)', marginBottom: '0.5rem',
            }}>
              Interested in collaborating?
            </h3>
            <p style={{
              fontSize: '0.9rem', color: 'hsl(215,20%,60%)',
              fontFamily: 'Inter, sans-serif', marginBottom: '1.5rem',
            }}>
              I'm always open to discussing new product ideas and opportunities.
            </p>
            <a
              href="/#contact"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = '/#contact'
              }}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
