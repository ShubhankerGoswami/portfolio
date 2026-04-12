const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
)

export default function Education() {
  return (
    <section id="education" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <h2>Education & <span className="text-gradient-accent">Certifications</span></h2>
          <div className="section-line section-line-accent"></div>
        </div>

        <div className="edu-grid">
          {/* Education Column */}
          <div className="edu-column">
            <h3 className="edu-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0-.019 1.838L11.17 15a2 2 0 0 0 1.66 0l8.59-4.078Z"></path>
                <path d="M22 10v6"></path>
                <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"></path>
              </svg>
              Education
            </h3>

            <div className="edu-card glass-card">
              <div className="edu-card-header">
                <h4>M.B.A.</h4>
                <span className="badge">2020 – 2022</span>
              </div>
              <p>
                <BookIcon />
                Indian Institute of Management (IIM), Nagpur
              </p>
            </div>

            <div className="edu-card glass-card">
              <div className="edu-card-header">
                <h4>B.Tech. in Electronics & Instrumentation</h4>
                <span className="badge">2012 – 2016</span>
              </div>
              <p>
                <BookIcon />
                Krishna Institute of Engineering & Technology (KIET)
              </p>
            </div>
          </div>

          {/* Certifications Column */}
          <div className="edu-column">
            <h3 className="edu-title edu-title-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="6"></circle>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
              </svg>
              Certifications
            </h3>

            <div className="cert-card glass-card">
              <div className="cert-card-header">
                <div>
                  <h4>Masters Union – Product Management</h4>
                  <span className="cert-score">Core PM skills across the full product lifecycle</span>
                </div>
              </div>
            </div>

            <div className="cert-card glass-card">
              <div className="cert-card-header">
                <h4>KPMG Certified Lean Six Sigma Green Belt (SQL)</h4>
                <span className="badge badge-accent">2021</span>
              </div>
            </div>

            <div className="cert-card glass-card">
              <div className="cert-card-header">
                <div>
                  <h4>ISCEA Certified Supply Chain Analyst (CSCA)</h4>
                  <span className="cert-score">Score: 93%</span>
                </div>
                <span className="badge badge-accent">2021</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
