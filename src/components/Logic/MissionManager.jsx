import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'
import useGameStore from '../../stores/useGameStore.js'
import { zoneConfig } from '../../data/portfolio.js'

export default function MissionManager() {
    const setMission = useGameStore((state) => state.setMission)
    const currentMission = useGameStore((state) => state.currentMission)

    // Scale down positions for the demo
    const missions = zoneConfig.map(zone => ({
        ...zone,
        position: new THREE.Vector3(zone.position.x * 0.1, 0, zone.position.z * 0.1)
    }))

    useFrame((state) => {
        // Simple distance check from camera (since we don't track player exact pos in store yet)
        // Better: tack player/vehicle position in store or use a ref passed down.
        // For now, using camera position which roughly follows player is okay-ish for a quick demo,
        // but let's try to find the player object in scene by name if we can, or just rely on camera lookAt target.
        const playerPos = state.camera.position

        let nearest = null;
        let dist = Infinity;

        missions.forEach(mission => {
            const d = playerPos.distanceTo(mission.position)
            if (d < 5 && d < dist) {
                nearest = mission
                dist = d
            }
        })

        if (nearest && (!currentMission || currentMission.id !== nearest.id)) {
            setMission({ title: nearest.name, description: nearest.description })
        } else if (!nearest && currentMission) {
            setMission(null)
        }
    })

    return (
        <group>
            {missions.map(mission => (
                <group key={mission.id} position={mission.position}>
                    {/* Mission Marker Visual */}
                    <mesh position-y={1}>
                        <cylinderGeometry args={[1, 1, 0.2, 32]} />
                        <meshStandardMaterial color={new THREE.Color(mission.color)} transparent opacity={0.5} />
                    </mesh>
                    <mesh position-y={1}>
                        <ringGeometry args={[0.8, 0.9, 32]} />
                        <meshBasicMaterial color="white" />
                    </mesh>

                    {/* Floating Icon */}
                    <Html position={[0, 2.5, 0]} center transform sprite>
                        <div style={{ fontSize: '24px', background: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '50%' }}>
                            {mission.icon}
                        </div>
                    </Html>

                    {/* Light Beacon */}
                    <pointLight color={mission.color} distance={10} intensity={2} />
                </group>
            ))}
        </group>
    )
}
