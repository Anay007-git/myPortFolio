import React from 'react'
import useGameStore from '../../stores/useGameStore.js'

export default function GtaHud() {
    const xp = useGameStore(state => state.xp)
    const level = useGameStore(state => state.level)

    // Level 1-5 maps to stars
    const stars = [1, 2, 3, 4, 5]

    return (
        <div style={{
            position: 'fixed',
            top: '30px',
            right: '40px',
            textAlign: 'right',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '5px'
        }}>
            {/* Money (Experience) */}
            <div className="hud-text hud-money">
                ${xp.toLocaleString()}
            </div>

            {/* Wanted Level (Level Progress) */}
            <div className="star-container">
                {stars.map(s => (
                    <span key={s} className={`star ${level >= s ? 'active' : ''}`}>★</span>
                ))}
            </div>

            {/* Level Label */}
            <div style={{
                fontFamily: 'var(--font-header)',
                fontSize: '0.7rem',
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 8px',
                marginTop: '10px'
            }}>
                RANK {level}
            </div>
        </div>
    )
}
