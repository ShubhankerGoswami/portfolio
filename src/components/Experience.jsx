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
        name: 'Insight 360 – AI Agents & RAG Enterprise Solution',
        ongoing: false,
        bullets: [
          <>Launched enterprise RAG platform in 3 months, scaling to <strong>100+ DAU</strong> during early adoption</>,
          <>Built AI agent-based architecture for intent-driven external data retrieval, unlocking new use cases and driving onboarding of <strong>5+ enterprise clients</strong></>,
          'Designed multimodal customisable document intelligence pipeline (OCR + layout parsing + embeddings + retrieval) enabling multi-format knowledge access',
          <>Reduced manual document effort by <strong>~90%</strong> by improving enterprise knowledge retrieval workflows</>,
          <>Ran a live A/B test of hybrid retrieval (semantic + keyword) against a semantic-only baseline, lifting answer-acceptance by <strong>~70%</strong>, then shipped hybrid as the default retriever</>,
          'Optimized architecture using open-source Models & LLMs, reducing dependency on paid APIs and improving cost efficiency',
          <>Led a <strong>20-member cross-functional team</strong> across engineering, design, and QA through <strong>Agile/Scrum</strong> sprints to ship MVP under tight timelines</>,
          'Crafted product narrative and investment pitch, securing internal funding and enabling enterprise sales',
          'Earned recognition in internal & client evaluations as a leading open-source, RAG-enabled solution',
        ],
      },
      {
        name: 'Ostrich AI — Decentralized AI Infra & Hackathon-Driven AI/ML Model Innovation',
        ongoing: false,
        bullets: [
          <>Architected and launched decentralized AI infrastructure platform, integrating <strong>blockchain-based data security</strong> with distributed compute nodes, enabling secure AI/ML model deployment while reducing infrastructure costs by <strong>up to 70%</strong> vs. traditional cloud providers like AWS or Azure</>,
          'Owned end-to-end product vision, strategy, and roadmap, taking product from problem definition → MVP',
          'Translated ambiguous enterprise use cases into a scalable AI-driven product, aligning business goals with technical architecture',
          <>Led <strong>12+ member cross-functional team</strong> including Product Managers, engineers, designers, and QA to deliver MVP under aggressive timelines</>,
          <>Enabled early enterprise adoption, onboarding <strong>ICICI Bank &amp; Abu Dhabi Bank</strong> during MVP phase for Pilot</>,
          'Built the hackathon creation flow and an AI-powered evaluation framework that automatically scored and ranked AI/ML model submissions, replacing subjective manual judging with consistent, scalable evals',
          'Designed end-to-end user journeys, wireframes, Agile Sprints, and prioritization frameworks, aligning stakeholders and accelerating product execution',
        ],
      },
      {
        name: 'Second Brain AI — Insurance Fraud Detection & Claims Platform (0→1)',
        ongoing: true,
        bullets: [
          <>Driving 0→1 development of AI-powered fraud detection platform, leveraging <strong>RAG AI, Machine Learning, and Knowledge Graphs</strong> to identify anomalies in insurance claims</>,
          <>Building document intelligence system for insurance claims, enabling automated processing at scale and targeting <strong>~90% reduction</strong> in manual intervention</>,
          <>Developing plug-and-play AI chatbot solution for employee policy &amp; claims queries, with seamless integration into enterprise ecosystems via SDKs and platforms like <strong>MS Teams and Slack</strong></>,
          <>Leveraging <strong>AI-assisted development (Claude Code)</strong> to independently build core product modules, accelerating MVP timelines and reducing engineering dependency</>,
          <>Executing GTM strategy via LinkedIn-led outreach, building early B2B pipeline, and developing an <strong>AI-driven prospecting agent</strong> to automate ICP targeting and engagement</>,
          'Shaping product positioning and use-case strategy through competitive analysis of insurance fraud detection solutions',
        ],
      },
      {
        name: 'FOSTER – 0→1 EdTech Campus Networking & Hiring Platform',
        ongoing: false,
        bullets: [
          'Contributed to building a multi-sided networking platform connecting colleges, students, and employers across India',
          <>Drove product direction and execution, supporting onboarding of <strong>10,000+ colleges</strong> and <strong>100+ employers</strong> within the first year</>,
          'Defined market entry strategy, feature prioritization, and release roadmap to drive B2B platform adoption',
          'Leveraged user insights, user feedback, and performance data to continuously refine product strategy, features, and improve engagement',
          'Collaborated with leadership on pricing strategy and long-term roadmap, influencing revenue and retention',
        ],
      },
      {
        name: 'AI Automation & PoCs',
        ongoing: false,
        bullets: [
          <>Led <strong>two PoCs that each converted into a signed development contract</strong>: a multi-agent voice agent for a sports club in New Zealand, and a multi-agent orchestrator workspace-booking chatbot for Upflex</>,
          <>Accelerate PRDs, user stories, and rapid prototyping daily using <strong>Claude (Skills, Subagents)</strong>, ChatGPT, Claude Design, Lovable, and Figma Make</>,
          <>Independently build AI web apps, AI agents, and React (FE) + Python (BE) modules with <strong>Claude Code &amp; Codex</strong> — idea to working product, minimal engineering dependency</>,
          <>Built AI-driven CRM automation pipeline (n8n + GPT), reducing manual effort by <strong>~40%</strong> and improving lead management efficiency</>,
          'Developed LLM-based lead generation system to identify and qualify prospects, enhancing lead discovery efficiency',
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
