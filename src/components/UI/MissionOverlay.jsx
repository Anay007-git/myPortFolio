import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useGameStore from '../../stores/useGameStore.js'

export default function MissionOverlay() {
    const show = useGameStore(state => state.showMissionPassed)
    const questName = useGameStore(state => state.lastCompletedQuest)
    const overlayRef = useRef()

    useEffect(() => {
        if (show) {
            gsap.to(overlayRef.current, {
                opacity: 1,
                scale: 1,
                duration: 0.1,
                ease: 'power4.out'
            })

            gsap.fromTo(overlayRef.current.querySelector('.mission-passed-title'),
                { scale: 3, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)', delay: 0.1 }
            )

            // Horizontal bars effect
            gsap.fromTo('.mission-bar',
                { width: 0 },
                { width: '100%', duration: 0.4, stagger: 0.1, ease: 'power2.inOut' }
            )
        } else {
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.3
            })
        }
    }, [show])

    return (
        <div ref={overlayRef} className="mission-overlay">
            <div className="mission-bar" style={{ height: '4px', background: 'var(--gta-yellow)', marginBottom: '50px' }}></div>

            <h1 className="mission-passed-title">MISSION PASSED</h1>
            <div style={{ fontFamily: 'var(--font-header)', color: 'white', letterSpacing: '4px', marginTop: '10px', fontSize: '1.2rem' }}>
                {questName?.toUpperCase()}
            </div>
            <div className="mission-reward" style={{ marginTop: '20px' }}>
                +100 XP | +$10,000
            </div>

            <div className="mission-bar" style={{ height: '4px', background: 'var(--gta-yellow)', marginTop: '50px' }}></div>
        </div>
    )
}
