export default function About() {
  const highlights = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
        </svg>
      ),
      title: '4+ Years',
      desc: 'Product Management Experience',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
        </svg>
      ),
      title: '0→1 Products',
      desc: 'AI & SaaS Product Development',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: '20+ Teams',
      desc: 'Cross-functional Leadership',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
          <path d="M2 12h20"></path>
        </svg>
      ),
      title: '1-3 Months',
      desc: 'MVP Delivery Timeline',
    },
  ]

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-header">
          <h2>About <span className="text-gradient-primary">Me</span></h2>
          <div className="section-line"></div>
        </div>

        <div className="glass-card about-card">
          <p>
            IIM Alumnus & Product Manager with over <strong>4 years of experience</strong> delivering
            0–1 AI, enterprise, and SaaS products across client-led and in-house environments,
            owning the full product lifecycle from discovery to post-launch optimization.
          </p>
          <p>
            Proven expertise in <strong>product vision, roadmap definition, MVP execution,
            and go-to-market strategy</strong>, consistently delivering MVPs within 1–3 months under tight timelines.
          </p>
          <p>
            Strong background in <span className="text-gradient-accent"><strong>Generative AI, RAG platforms, LLMs, and AI-driven automation</strong></span>,
            with hands-on experience building cost-efficient, scalable enterprise solutions.
          </p>
        </div>

        <div className="highlights-grid">
          {highlights.map(({ icon, title, desc }) => (
            <div className="glass-card highlight-card" key={title}>
              <div className="highlight-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
