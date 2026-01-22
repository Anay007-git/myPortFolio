import { OrbitControls } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import useGameStore from './stores/useGameStore.js'
import Player from './components/Player/Player.jsx'
import World from './components/World/World.jsx'
import Car from './components/Vehicle/Car.jsx'
import MissionManager from './components/Logic/MissionManager.jsx'
import useMultiplayer from './hooks/useMultiplayer.js'
import GhostPlayer from './components/Network/GhostPlayer.jsx'
import Environment from './components/World/Environment.jsx'

export default function Experience() {
    const controlMode = useGameStore((state) => state.controlMode)
    const { players, mySocketId } = useMultiplayer()

    return <>
        <OrbitControls makeDefault />

        <Environment />

        <MissionManager />
        <World />

        {/* Network Players */}
        {Object.entries(players).map(([id, data]) => {
            if (id === mySocketId) return null
            return <GhostPlayer key={id} position={data.position} rotation={data.rotation} />
        })}

        {controlMode === 'character' && <Player />}
        {/* We always render the car, but we only control it if mode is vehicle */}
        <Car position={[0, 2, -10]} />
    </>
}
