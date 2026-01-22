import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useGameStore from '../../stores/useGameStore.js'

export default function Navbar() {
    const navRef = useRef()
    const level = useGameStore(state => state.level)
    const title = useGameStore(state => state.title)

    useEffect(() => {
        gsap.from(navRef.current, {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        })
    }, [])

    return (
        <nav ref={navRef} className="glass" style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '1200px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 30px',
            zIndex: 1000
        }}>
            <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                ANAY.BIZ
            </h1>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <a href="#hero" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>Intro</a>
                <a href="#experience" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>Experience</a>
                <a href="#skills" style={{ textDecoration: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>Arsenal</a>
                <div className="level-badge">LVL {level}: {title}</div>
            </div>
        </nav>
    )
}
