import { RigidBody } from '@react-three/rapier'
import { MeshReflectorMaterial, Environment } from '@react-three/drei'

// Optimized Modular City Configuration
const BUILDING_COUNT = 45

const buildings = Array.from({ length: BUILDING_COUNT }, (_, i) => {
    // Generate grid-based positions
    const gridX = (i % 9) - 4
    const gridZ = Math.floor(i / 9) - 2

    // Grid spacing
    const spacingX = 30
    const spacingZ = 30

    const x = gridX * spacingX + (Math.random() - 0.5) * 10
    const z = gridZ * spacingZ + (Math.random() - 0.5) * 10

    // Skip center area for spawning
    if (Math.abs(x) < 15 && Math.abs(z) < 15) return null

    const width = 10 + Math.random() * 10
    const height = 20 + Math.random() * 60
    const depth = 10 + Math.random() * 10

    const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483']
    const color = colors[Math.floor(Math.random() * colors.length)]

    return { pos: [x, height / 2, z], size: [width, height, depth], color }
}).filter(Boolean)

export default function World() {
    return (
        <group>
            {/* Massive Digital Ground with Reflections */}
            <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
                <mesh receiveShadow rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[1000, 1000]} />
                    <meshStandardMaterial color="#101010" roughness={0.5} metalness={0.5} />
                </mesh>
                {/* Visual Grid Layer */}
                <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[1000, 1000]} />
                    <meshBasicMaterial
                        color="#00f2ff"
                        transparent
                        opacity={0.15}
                        wireframe
                    />
                </mesh>
            </RigidBody>

            <Environment preset="night" />

            {/* Modular Buildings */}
            {buildings.map((b, i) => (
                <RigidBody key={i} type="fixed" colliders="cuboid" position={b.pos}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={b.size} />
                        <meshStandardMaterial color={b.color} />
                    </mesh>
                    {/* Building Lights/Windows Bloom Effect */}
                    <mesh position={[0, 0, b.size[2] / 2 + 0.1]}>
                        <planeGeometry args={[b.size[0] * 0.8, b.size[1] * 0.8]} />
                        <meshStandardMaterial
                            color="#fff"
                            emissive="#00f2ff"
                            emissiveIntensity={0.8}
                            transparent
                            opacity={0.15}
                        />
                    </mesh>
                </RigidBody>
            ))}

            {/* Roads Layout */}
            <group position={[0, 0.02, 0]}>
                <mesh rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[1000, 15]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
                <mesh rotation-x={-Math.PI / 2} rotation-z={Math.PI / 2}>
                    <planeGeometry args={[1000, 15]} />
                    <meshStandardMaterial color="#111" />
                </mesh>
            </group>
        </group>
    )
}
