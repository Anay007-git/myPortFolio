import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { portfolioData } from '../../data/portfolio.js'
import useGameStore from '../../stores/useGameStore.js'

gsap.registerPlugin(ScrollTrigger)

export default function ExperienceSection() {
    const sectionRef = useRef()
    const completeQuest = useGameStore(state => state.completeQuest)

    useEffect(() => {
        const cards = sectionRef.current.querySelectorAll('.exp-card')

        gsap.from(cards, {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 60%',
            },
            x: -100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.3,
            ease: 'power3.out',
            onComplete: () => completeQuest(1) // "Analyze Experience Section"
        })
    }, [])

    return (
        <section id="experience" ref={sectionRef}>
            <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'var(--accent-secondary)' }}>01.</span> CAREER TIMELINE
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {portfolioData.experience.map((exp, i) => (
                    <div key={i} className="glass exp-card" style={{ padding: '30px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>{exp.role}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>{exp.company} | {exp.location}</p>
                            </div>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{exp.duration}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '15px' }}>{exp.description}</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            {exp.highlights.map((h, j) => (
                                <li key={j} style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '5px' }}>{h}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    )
}
