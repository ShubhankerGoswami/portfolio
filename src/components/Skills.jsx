const coreSkills = [
  'Product Vision & Strategy',
  'Product Roadmapping',
  '0–1 Product Development',
  'Go-to-Market Strategy (GTM)',
  'Agile & Scrum Methodologies',
  'MVP Launch & Product Iteration',
  'Sprint Planning & Execution',
  'Stakeholder Management',
  'Performance Metrics & KPIs',
  'Product Prototyping & Wireframing',
  'Customer Discovery & Validation',
  'Cross-functional Team Leadership',
  'JIRA & Azure DevOps',
  'FIGMA & Miro',
]

const aiSkills = [
  'Generative AI',
  'AI Agents',
  'LLMs',
  'RAG Systems',
  'Machine Learning',
  'Speech Models (TTS & STT)',
  'NLP',
  'AI Coding – Claude Code',
  'OpenAI Codex',
]

const techSkills = [
  { label: 'Programming & Scripting', tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Python', 'SQL'] },
  { label: 'Web & Application', tags: ['REST APIs', 'System Design', 'Databases'] },
  { label: 'Data & Analytics', tags: ['Tableau', 'Data Analytics', 'MS Excel'] },
  { label: 'Digital Marketing', tags: ['Google Ads', 'Google Analytics', 'Keyword Research', 'WordPress'] },
]

export default function Skills() {
  return (
    <section id="skills" className="section section-alt">
      <div className="container">
        <div className="section-header">
          <h2>Skills & <span className="text-gradient-primary">Expertise</span></h2>
          <div className="section-line"></div>
        </div>

        <div className="skills-grid">
          <div className="glass-card">
            <h3>
              <span className="dot dot-primary"></span>
              Core Competencies
            </h3>
            <div className="skills-tags">
              {coreSkills.map(skill => (
                <span className="tag" key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3>
              <span className="dot dot-accent"></span>
              AI Skills
            </h3>
            <div className="skills-tags">
              {aiSkills.map(skill => (
                <span className="tag" key={skill}>{skill}</span>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3>
              <span className="dot dot-accent"></span>
              Technical Skills
            </h3>
            <div className="tech-skills">
              {techSkills.map(({ label, tags }) => (
                <div className="tech-category" key={label}>
                  <span className="tech-label">{label}</span>
                  <div className="tech-tags">
                    {tags.map(tag => (
                      <span className="tag tag-accent" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
