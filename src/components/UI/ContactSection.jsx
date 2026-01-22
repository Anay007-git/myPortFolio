import React from 'react'
import { portfolioData } from '../../data/portfolio.js'
import useGameStore from '../../stores/useGameStore.js'

export default function ContactSection() {
    const completeQuest = useGameStore(state => state.completeQuest)

    return (
        <section id="contact" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', marginBottom: '20px' }}>
                <span style={{ color: 'var(--accent-secondary)' }}>03.</span> CONNECT PROTOCOL
            </h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                Ready to initiate a data-driven collaboration? Reach out via one of the following channels to start the next mission.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <a
                    href={`mailto:${portfolioData.personal.email}`}
                    className="glass"
                    style={{ padding: '20px 40px', textDecoration: 'none', color: 'var(--accent-primary)', fontSize: '1rem', transition: '0.3s' }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0, 242, 255, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'var(--bg-card)'}
                    onClick={() => completeQuest(3)}
                >
                    Email Interface
                </a>
                <a
                    href={portfolioData.links.linkedin}
                    target="_blank"
                    className="glass"
                    style={{ padding: '20px 40px', textDecoration: 'none', color: 'var(--text-main)', fontSize: '1rem', transition: '0.3s' }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'var(--bg-card)'}
                >
                    LinkedIn Profile
                </a>
            </div>

            <footer style={{ marginTop: '100px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                &copy; {new Date().getFullYear()} ANAY BISWAS. ALL RIGHTS RESERVED.
            </footer>
        </section>
    )
}
