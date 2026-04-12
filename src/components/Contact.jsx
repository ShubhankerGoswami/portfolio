const ExternalLinkIcon = () => (
  <svg className="contact-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" x2="21" y1="14" y2="3"></line>
  </svg>
)

export default function Contact() {
  return (
    <section id="contact" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <h2>Let's <span className="text-gradient-primary">Connect</span></h2>
          <div className="section-line"></div>
          <p className="section-description">
            I'm always open to discussing product management opportunities,
            AI innovations, or interesting collaborations.
          </p>
        </div>

        <div className="contact-card glass-card">
          <a href="mailto:shubhanker55@gmail.com" className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Email</span>
              <span className="contact-value">shubhanker55@gmail.com</span>
            </div>
            <ExternalLinkIcon />
          </a>

          <a href="tel:+918527534288" className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Phone</span>
              <span className="contact-value">+91 852 753 4288</span>
            </div>
            <ExternalLinkIcon />
          </a>

          <a href="https://linkedin.com/in/shubhankergoswami" target="_blank" rel="noopener noreferrer" className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">Shubhanker Goswami</span>
            </div>
            <ExternalLinkIcon />
          </a>
          <a href="https://calendly.com/shubhankergoswami/30min" target="_blank" rel="noopener noreferrer" className="contact-item">
            <div className="contact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentcolor" stroke-width="2" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="6" width="13" height="12" rx="2" ry="2"></rect>

                <path d="M16 10L21 7V17L16 14V10Z"></path>
              </svg>

            </div>
            <div className="contact-info">
              <span className="contact-label">Calendlty</span>
              <span className="contact-value">Schedule 1-1 Meet</span>
            </div>
            <ExternalLinkIcon />
          </a>

          <div className="contact-cta">
            <a href="mailto:shubhanker55@gmail.com" className="btn btn-primary btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              Send Me an Email
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
