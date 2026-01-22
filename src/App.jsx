import Navbar from './components/UI/Navbar.jsx'
import Hero from './components/UI/Hero.jsx'
import ExperienceSection from './components/UI/ExperienceSection.jsx'
import SkillsSection from './components/UI/SkillsSection.jsx'
import ContactSection from './components/UI/ContactSection.jsx'
import Dashboard from './components/UI/Dashboard.jsx'

export default function App() {
    return (
        <div className="app">
            <div className="scanline"></div>
            <Navbar />
            <Dashboard />
            <main>
                <Hero />
                <ExperienceSection />
                <SkillsSection />
                <ContactSection />
            </main>
        </div>
    )
}
