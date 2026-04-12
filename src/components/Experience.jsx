const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" x2="16" y1="2" y2="6"></line>
    <line x1="8" x2="8" y1="2" y2="6"></line>
    <line x1="3" x2="21" y1="10" y2="10"></line>
  </svg>
)

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
  </svg>
)

const experiences = [
  {
    date: 'Apr 2022 – Present',
    current: true,
    role: 'AI Product Manager',
    company: 'Smartsense Consulting Solutions Pvt. Ltd.',
    projects: [
      {
        name: 'AI Agents & RAG Enterprise Solution – Insight 360',
        ongoing: false,
        bullets: [
          <>Launched enterprise RAG platform in 3 months, scaling to <strong>100+ DAU</strong> during early adoption, onboarding <strong>5+ enterprise clients</strong></>,
          'Built AI agent-based architecture for intent-driven external data retrieval, unlocking new use cases',
          'Designed multimodal customisable document intelligence pipeline (OCR + layout parsing + embeddings + retrieval) enabling multi-format knowledge access',
          <>Improved RAG retrieval accuracy by <strong>~70%</strong> via hybrid search (semantic + keyword-based retrieval)</>,
          <>Reduced manual document effort by <strong>~90%</strong> by improving enterprise knowledge retrieval workflows</>,
          'Optimized architecture using open-source Models & LLMs, reducing dependency on paid APIs',
          <>Led <strong>20-member cross-functional team</strong> across engineering, design, and QA to deliver MVP under tight timelines</>,
          'Crafted product narrative and investment pitch, securing internal funding and enabling enterprise sales',
          'Earned recognition in internal & client evaluations as a leading open-source, RAG-enabled solution',
        ],
      },
      {
        name: 'Ostrich AI – Decentralized AI Infrastructure (0→1 Product)',
        ongoing: false,
        bullets: [
          <>Architected and launched decentralized AI infrastructure platform integrating <strong>blockchain-based data security</strong> with distributed compute nodes</>,
          <>Enabled secure AI/ML model deployment while reducing infrastructure costs by <strong>up to 70%</strong> vs. traditional cloud providers</>,
          'Owned end-to-end product vision, strategy, roadmap, and GTM — from problem definition to MVP',
          <>Led <strong>12+ member cross-functional team</strong> including PMs, engineers, designers, and QA under aggressive timelines</>,
          <>Enabled early enterprise adoption, onboarding <strong>ICICI Bank &amp; Abu Dhabi Bank</strong> during MVP phase for Pilot</>,
          'Conducted user research and market analysis to identify unmet needs and define product-market fit',
          'Designed end-to-end user journeys, wireframes, Agile Sprints, and prioritization frameworks',
        ],
      },
      {
        name: 'Second Brain AI – Insurance AI (Fraud Detection & Claims Handling)',
        ongoing: true,
        bullets: [
          <>Driving 0→1 development of AI-powered fraud detection platform leveraging <strong>RAG AI, Machine Learning, and Knowledge Graphs</strong> to identify anomalies in insurance claims</>,
          <>Building document intelligence system for insurance claims, targeting <strong>~90% reduction</strong> in manual intervention</>,
          <>Developing plug-and-play AI chatbot for employee policy &amp; claims queries, with integration into <strong>MS Teams and Slack</strong> via SDKs</>,
          'Leveraging AI-assisted development (Claude Code) to independently build core product modules, accelerating MVP timelines',
          <>Executing GTM via LinkedIn-led outreach and developing an <strong>AI-driven prospecting agent</strong> to automate ICP targeting</>,
          'Shaping product positioning through competitive analysis of insurance fraud detection solutions',
        ],
      },
      {
        name: 'AI Automation & PoCs',
        ongoing: false,
        bullets: [
          <>Built AI-driven CRM automation pipeline (n8n + GPT), reducing manual effort by <strong>~40%</strong> and improving lead management efficiency</>,
          'Developed LLM-based lead generation system to identify and qualify prospects, enhancing lead discovery efficiency',
          <>Conceptualized and prototyped <strong>AI voice assistant</strong> for inbound calls, enabling successful client onboarding during PoC stage</>,
        ],
      },
      {
        name: 'FOSTER – Multi-sided Networking Platform (0→1 Product)',
        ongoing: false,
        bullets: [
          'Contributed to building a multi-sided networking platform connecting colleges, students, and employers across India',
          <>Drove product direction and execution, supporting onboarding of <strong>10,000+ colleges</strong> and <strong>100+ employers</strong> within the first year</>,
          'Defined market entry strategy, feature prioritization, and release roadmap to drive B2B platform adoption',
          'Leveraged user insights and performance data to continuously refine product strategy and improve engagement',
          'Collaborated with leadership on pricing strategy and long-term roadmap, influencing revenue and retention',
        ],
      },
    ],
  },
  {
    date: 'Jan 2017 – Feb 2019',
    current: false,
    role: 'Engineer',
    company: 'Green Power International',
    projects: [
      {
        name: 'Railway Electrification Projects',
        ongoing: false,
        bullets: [
          'Assisted in end-to-end project management for 572 km railway electrification, including site execution and vendor coordination',
          'Supported procurement, ERP-based planning, and manpower management, ensuring timely project delivery',
          'Worked directly with senior leadership on planning and billing activities, gaining early exposure to structured project management in EPC projects',
        ],
      },
    ],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <div className="section-header">
          <h2>Work <span className="text-gradient-primary">Experience</span></h2>
          <div className="section-line"></div>
        </div>

        <div className="timeline">
          <div className="timeline-line"></div>

          {experiences.map((exp, i) => (
            <div className="timeline-item" key={i}>
              <div className="timeline-dot"></div>
              <div className="timeline-content glass-card">
                <div className="timeline-header">
                  <span className="timeline-date">
                    <CalendarIcon />
                    {exp.date}
                  </span>
                  {exp.current && <span className="badge-current">Current</span>}
                </div>
                <h3>{exp.role}</h3>
                <p className="timeline-company">
                  <BuildingIcon />
                  {exp.company}
                </p>

                {exp.projects.map(project => (
                  <div className="project" key={project.name}>
                    <h4>
                      {project.name}
                      {project.ongoing && (
                        <span className="badge-current" style={{ marginLeft: '8px', fontSize: '0.7rem' }}>Ongoing</span>
                      )}
                    </h4>
                    <ul>
                      {project.bullets.map((bullet, j) => (
                        <li key={j}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
