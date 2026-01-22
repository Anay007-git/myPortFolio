import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { portfolioData } from '../../data/portfolio.js'
import useGameStore from '../../stores/useGameStore.js'

export default function SkillsSection() {
    const sectionRef = useRef()
    const addXp = useGameStore(state => state.addXp)
    const completeQuest = useGameStore(state => state.completeQuest)

    useEffect(() => {
        gsap.to('.intro-bar-skills', {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
            },
            width: '100%',
            duration: 1,
            ease: 'power2.inOut'
        })
    }, [])

    const handleSkillCollect = (skill) => {
        addXp(5)
        // Check if all skills were "looked at" (simulated)
        completeQuest(2) // "Harvest Tech Skills"
    }

    return (
        <section id="skills" ref={sectionRef}>
            <div className="intro-bar intro-bar-skills">
                <span className="intro-text">ARSENAL: TECH STACK HARVEST</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'var(--accent-primary)' }}>02.</span> TECH ARSENAL
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                {Object.entries(portfolioData.skills).map(([category, items], i) => (
                    <div key={i} className="glass" style={{ padding: '25px' }}>
                        <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '0.8rem', color: 'var(--accent-secondary)', marginBottom: '20px', letterSpacing: '2px' }}>
                            {category.toUpperCase()}
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {items.map((skill, j) => (
                                <div
                                    key={j}
                                    className="glass"
                                    style={{
                                        padding: '6px 15px',
                                        fontSize: '0.8rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)'
                                        e.target.style.transform = 'scale(1.1)'
                                        handleSkillCollect(skill)
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'var(--glass-border)'
                                        e.target.style.transform = 'scale(1)'
                                    }}
                                >
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
