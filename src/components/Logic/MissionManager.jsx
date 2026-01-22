import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'
import useGameStore from '../../stores/useGameStore.js'
import { zoneConfig } from '../../data/portfolio.js'

export default function MissionManager() {
    const setMission = useGameStore((state) => state.setMission)
    const completeQuest = useGameStore((state) => state.completeQuest)
    const currentMission = useGameStore((state) => state.currentMission)

    // Scale down positions for the world size
    const missions = zoneConfig.map(zone => ({
        ...zone,
        position: new THREE.Vector3(zone.position.x * 0.25, 0, zone.position.z * 0.25)
    }))

    useFrame((state) => {
        // Track the actual player object
        const player = state.scene.getObjectByName('player')
        if (!player) return

        const playerPos = player.position

        let nearest = null;
        let dist = Infinity;

        missions.forEach(mission => {
            const d = playerPos.distanceTo(mission.position)
            if (d < 6 && d < dist) {
                nearest = mission
                dist = d
            }
        })

        if (nearest && (!currentMission || currentMission.id !== nearest.id)) {
            setMission({ id: nearest.id, title: nearest.name, description: nearest.description })

            // Only complete if it maps to a quest ID
            // Simple mapping: about -> 1, skills -> 2, contact -> 3, experience -> 4
            const questMap = { 'about': 1, 'skills': 2, 'contact': 3, 'experience': 4 }
            if (questMap[nearest.id]) {
                completeQuest(questMap[nearest.id])
            }
        } else if (!nearest && currentMission) {
            setMission(null)
        }
    })

    return (
        <group>
            {missions.map(mission => (
                <group key={mission.id} position={mission.position}>
                    {/* Mission Marker Visual - Pulsing Ring */}
                    <mesh position-y={0.1} rotation-x={-Math.PI / 2}>
                        <ringGeometry args={[2, 2.2, 32]} />
                        <meshBasicMaterial color={new THREE.Color(mission.color)} transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>

                    <mesh position-y={0.15} rotation-x={-Math.PI / 2}>
                        <circleGeometry args={[2, 32]} />
                        <meshBasicMaterial color={new THREE.Color(mission.color)} transparent opacity={0.1} side={THREE.DoubleSide} />
                    </mesh>

                    {/* Light Beacon */}
                    <pointLight color={mission.color} distance={15} intensity={5} position={[0, 2, 0]} />

                    {/* Floating Label */}
                    <Html position={[0, 2, 0]} center distanceFactor={15}>
                        <div className="bg-black/80 text-white px-3 py-1 rounded border-2 border-[#ff0055] whitespace-nowrap font-bold uppercase tracking-tighter">
                            {mission.name}
                        </div>
                    </Html>
                </group>
            ))}
        </group>
    )
}
