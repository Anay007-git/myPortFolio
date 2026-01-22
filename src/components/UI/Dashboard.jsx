import useGameStore from '../../stores/useGameStore.js'

export default function Dashboard() {
    const xp = useGameStore(state => state.xp)
    const level = useGameStore(state => state.level)
    const quests = useGameStore(state => state.quests)

    return (
        <div className="glass" style={{
            position: 'fixed',
            right: '20px',
            top: '100px',
            width: '250px',
            padding: '20px',
            zIndex: 999
        }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '0.9rem', marginBottom: '10px' }}>LOGS & STATS</h3>

            <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                    <span>XP PROGRESS</span>
                    <span>{xp}/{level * 100}</span>
                </div>
                <div className="xp-bar-container">
                    <div className="xp-bar-fill" style={{ width: `${(xp / (level * 100)) * 100}%` }}></div>
                </div>
            </div>

            <h4 style={{ fontSize: '0.7rem', color: 'var(--text-dim)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px', marginBottom: '10px' }}>ACTIVE QUESTS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quests.map(quest => (
                    <div key={quest.id} style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '0.8rem', color: quest.completed ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                        <div style={{
                            width: '12px', height: '12px', border: '1px solid var(--accent-primary)',
                            marginTop: '2px', background: quest.completed ? 'var(--accent-primary)' : 'transparent'
                        }}></div>
                        <span>{quest.text}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
