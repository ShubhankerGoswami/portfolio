import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Education from './components/Education'
import Achievements from './components/Achievements'
import Contact from './components/Contact'
import ChatBot from './components/ChatBot'
import VoiceAgent from './components/VoiceAgent'
import Footer from './components/Footer'
import Projects from './components/Projects'
import Resume from './components/Resume'
import RecruiterPage from './components/RecruiterPage'

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Achievements />
      <Contact />
    </>
  )
}

const BACKEND_BASE = window.location.host.split(':')[0] === 'localhost'
  ? 'http://localhost:10000'
  : 'https://portfoliobackend-q666.onrender.com'

export default function App() {
  const location = useLocation()
  const isRecruiterPage = location.pathname === '/recruiter'

  // Wake up the Render free-tier backend as soon as any page loads.
  // mode:'no-cors' lets the request through even before CORS is fully negotiated;
  // we only need the server to receive it — response is intentionally ignored.
  useEffect(() => {
    fetch(`${BACKEND_BASE}/ping`, { mode: 'no-cors' }).catch(() => {})
  }, [])

  return (
    <>
      {!isRecruiterPage && <Navbar />}
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/projects"  element={<Projects />} />
        <Route path="/resume"    element={<Resume />} />
        <Route path="/recruiter" element={<RecruiterPage />} />
      </Routes>
      {!isRecruiterPage && <VoiceAgent />}
      {!isRecruiterPage && <ChatBot />}
      {!isRecruiterPage && <Footer />}
    </>
  )
}
