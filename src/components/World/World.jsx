import { RigidBody } from '@react-three/rapier'

// Simple procedural city - no external models needed
const buildings = [
    // Row 1
    { pos: [-15, 3, -15], size: [4, 6, 4], color: '#4a90d9' },
    { pos: [-8, 5, -15], size: [5, 10, 5], color: '#5a5a5a' },
    { pos: [0, 4, -15], size: [6, 8, 4], color: '#8b4513' },
    { pos: [8, 6, -15], size: [4, 12, 4], color: '#2f4f4f' },
    { pos: [15, 3, -15], size: [5, 6, 5], color: '#696969' },

    // Row 2
    { pos: [-15, 4, -5], size: [5, 8, 5], color: '#708090' },
    { pos: [-8, 7, -5], size: [4, 14, 4], color: '#4682b4' },
    { pos: [8, 5, -5], size: [6, 10, 6], color: '#556b2f' },
    { pos: [15, 3, -5], size: [4, 6, 4], color: '#8b0000' },

    // Row 3
    { pos: [-15, 2, 10], size: [6, 4, 4], color: '#a0522d' },
    { pos: [-8, 4, 10], size: [5, 8, 5], color: '#6b8e23' },
    { pos: [0, 6, 10], size: [4, 12, 4], color: '#483d8b' },
    { pos: [8, 3, 10], size: [5, 6, 5], color: '#b8860b' },
    { pos: [15, 5, 10], size: [4, 10, 4], color: '#2e8b57' },
]

export default function World() {
    return (
        <group>
            {/* Procedural Buildings */}
            {buildings.map((b, i) => (
                <RigidBody key={i} type="fixed" colliders="cuboid" position={b.pos}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={b.size} />
                        <meshStandardMaterial color={b.color} />
                    </mesh>
                </RigidBody>
            ))}

            {/* Ground */}
            <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
                <mesh receiveShadow rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#3a5f3a" />
                </mesh>
            </RigidBody>

            {/* Roads - X axis */}
            <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[100, 6]} />
                <meshStandardMaterial color="#333333" />
            </mesh>

            {/* Roads - Z axis */}
            <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
                <planeGeometry args={[6, 100]} />
                <meshStandardMaterial color="#333333" />
            </mesh>
        </group>
    )
}
