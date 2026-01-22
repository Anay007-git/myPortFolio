import GtaHud from './components/UI/GtaHud.jsx'
import MissionOverlay from './components/UI/MissionOverlay.jsx'

export default function App() {
    return (
        <div className="app">
            <div className="scanline"></div>
            <Navbar />
            <GtaHud />
            <MissionOverlay />
            <main>
                <Hero />
                <ExperienceSection />
                <SkillsSection />
                <ContactSection />
            </main>
        </div>
    )
}
