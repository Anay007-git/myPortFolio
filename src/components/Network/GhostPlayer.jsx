import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GhostPlayer({ position, rotation }) {
    const group = useRef()

    useFrame((state, delta) => {
        if (!group.current) return

        // Linear interpolation for smooth movement
        group.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), delta * 10)

        // Quaternion slerp
        const targetQuat = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
        group.current.quaternion.slerp(targetQuat, delta * 10)
    })

    return (
        <group ref={group} position={[position.x, position.y, position.z]}>
            {/* Visuals - similar to Player but transparent/ghostly */}
            <mesh position={[0, 1, 0]}>
                <capsuleGeometry args={[0.5, 1, 4, 8]} />
                <meshStandardMaterial color="#00ffff" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 1.5, 0.5]}>
                <boxGeometry args={[0.2, 0.2, 0.5]} />
                <meshStandardMaterial color="white" />
            </mesh>

            <pointLight color="#00ffff" distance={3} intensity={0.5} />
        </group>
    )
}
