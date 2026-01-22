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
     * Gamification State
     */
    xp: 0,
    level: 1,
    title: 'Junior Data Novice',
    quests: [
        { id: 1, text: 'Analyze Experience Section', completed: false, xp: 50 },
        { id: 2, text: 'Harvest Tech Skills', completed: false, xp: 30 },
        { id: 3, text: 'Initiate Contact Protocol', completed: false, xp: 20 },
    ],

    addXp: (amount) => set((state) => {
        const newXp = state.xp + amount
        const nextLevelXp = state.level * 100

        if (newXp >= nextLevelXp) {
            const nextLevel = state.level + 1
            const titles = ['Junior Data Novice', 'BI Apprentice', 'Data Alchemist', 'BI Specialist', 'Senior BI Architect']
            return {
                xp: newXp - nextLevelXp,
                level: nextLevel,
                title: titles[Math.min(nextLevel - 1, titles.length - 1)]
            }
        }
        return { xp: newXp }
    }),

    showMissionPassed: false,
    lastCompletedQuest: null,

    setShowMissionPassed: (show, quest = null) => set(() => ({ showMissionPassed: show, lastCompletedQuest: quest })),

    completeQuest: (id) => set((state) => {
        const quest = state.quests.find(q => q.id === id)
        if (quest && !quest.completed) {
            state.addXp(quest.xp)
            state.setShowMissionPassed(true, quest.text)

            // Auto hide after 3 seconds
            setTimeout(() => {
                set({ showMissionPassed: false })
            }, 3000)

            return {
                quests: state.quests.map(q => q.id === id ? { ...q, completed: true } : q)
            }
        }
        return {}
    }),

    setMission: (mission) => set(() => ({ currentMission: mission })),
}))
