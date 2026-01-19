import useGameStore from '../../stores/useGameStore.js'
import { useEffect, useState } from 'react'

export default function Interface() {
    const phase = useGameStore((state) => state.phase)
    const controlMode = useGameStore((state) => state.controlMode)
    const currentMission = useGameStore((state) => state.currentMission)

    // We can add a local state for interaction prompt if we had a way to broadcast it
    // For now, static or store based

    return (
        <div className="ui-container">
            {/* HUD */}
            <div className="absolute top-4 left-4 text-white font-bold text-xl drop-shadow-md">
                <div className="bg-black/50 p-4 rounded-lg border-l-4 border-[#ff0055]">
                    <h1>ANAY CITY</h1>
                    <div className="text-sm font-normal opacity-80">
                        {controlMode === 'character' ? 'ON FOOT' : 'DRIVING'}
                    </div>
                </div>
            </div>

            {/* Controls Helper */}
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 p-4 rounded-lg">
                <p><span className="font-bold text-[#ff0055]">W A S D</span> to Move</p>
                <p><span className="font-bold text-[#ff0055]">SHIFT</span> to Run</p>
                <p><span className="font-bold text-[#ff0055]">SPACE</span> to Jump</p>
                <p><span className="font-bold text-[#ff0055]">E</span> to Interact/Enter Car</p>
            </div>

            {/* Mission / Objective */}
            {currentMission ? (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/70 text-white p-6 rounded-xl text-center min-w-[300px] border-b-4 border-yellow-400">
                    <h2 className="text-yellow-400 font-black tracking-widest uppercase mb-1">Mission Active</h2>
                    <p className="text-lg">{currentMission.title}</p>
                </div>
            ) : (
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded text-right">
                    <p className="text-sm text-gray-400 uppercase tracking-widest">No Active Mission</p>
                    <p>Explore the city</p>
                </div>
            )}
        </div>
    )
}
