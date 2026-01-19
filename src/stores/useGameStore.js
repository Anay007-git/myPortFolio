import { create } from 'zustand'

export default create((set) => ({
    /**
     * Phases: 'ready' | 'playing' | 'ended'
     */
    phase: 'ready',

    /**
     * Controls: 'character' | 'vehicle'
     */
    controlMode: 'character',

    /**
     * Missions
     */
    currentMission: null,

    start: () => set((state) => {
        if (state.phase === 'ready')
            return { phase: 'playing' }
        return {}
    }),

    restart: () => set((state) => {
        if (state.phase === 'playing' || state.phase === 'ended')
            return { phase: 'ready', controlMode: 'character', currentMission: null }
        return {}
    }),

    end: () => set((state) => {
        if (state.phase === 'playing')
            return { phase: 'ended' }
        return {}
    }),

    setControlMode: (mode) => set(() => ({ controlMode: mode })),

    setMission: (mission) => set(() => ({ currentMission: mission })),
}))
