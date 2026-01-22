import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { portfolioData } from '../../data/portfolio.js'
import useGameStore from '../../stores/useGameStore.js'

export default function Hero() {
    const heroRef = useRef()
    const contentRef = useRef()
    const addXp = useGameStore(state => state.addXp)

    useEffect(() => {
        const tl = gsap.timeline()

        // GTA Intro Bar Animation
        tl.to('.intro-bar-hero', {
            width: '100%',
            duration: 1,
            ease: 'power2.inOut'
        })

        tl.from(contentRef.current.children, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        }, "-=0.3")

        // Initial XP for arriving
        setTimeout(() => addXp(10), 2000)
    }, [])

    return (
        <section id="hero" ref={heroRef} style={{ textAlign: 'center' }}>
            <div className="intro-bar intro-bar-hero">
                <span className="intro-text">MISSION: ESTABLISH PROTOCOL</span>
            </div>
            <div ref={contentRef}>
                <h2 style={{
                    fontFamily: 'var(--font-header)',
                    fontSize: '4rem',
                    marginBottom: '10px',
                    background: 'linear-gradient(to right, #00f2ff, #ff0055)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {portfolioData.personal.name.toUpperCase()}
                </h2>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', marginBottom: '30px', fontWeight: '300' }}>
                    {portfolioData.personal.title}
                </h3>
                <p style={{ maxWidth: '700px', margin: '0 auto', lineHeight: '1.8', color: 'var(--text-dim)' }}>
                    {portfolioData.personal.summary}
                </p>
                <div style={{ marginTop: '40px' }}>
                    <button className="glass" style={{
                        padding: '12px 30px',
                        background: 'transparent',
                        color: 'var(--accent-primary)',
                        border: '1px solid var(--accent-primary)',
                        fontFamily: 'var(--font-header)',
                        fontSize: '0.8rem',
                        transition: 'all 0.3s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--accent-primary)'
                            e.target.style.color = 'var(--bg-dark)'
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent'
                            e.target.style.color = 'var(--accent-primary)'
                        }}
                        onClick={() => document.getElementById('experience').scrollIntoView({ behavior: 'smooth' })}
                    >
                        COMMENCE MISSION
                    </button>
                </div>
            </div>
        </section>
    )
}
