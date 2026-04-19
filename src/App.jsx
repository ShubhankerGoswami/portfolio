import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/resume" element={<Resume />} />
      </Routes>
      <VoiceAgent />
      <ChatBot />
      <Footer />
    </>
  )
}
