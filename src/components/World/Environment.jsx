import { useRef } from 'react'
import { Stars } from '@react-three/drei'

export default function Environment() {
    const light = useRef()

    return (
        <group>
            <ambientLight intensity={0.5} />
            <directionalLight
                ref={light}
                castShadow
                position={[50, 50, 50]}
                intensity={1.5}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={500}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />
            {/* Cyberpunk Accents */}
            <pointLight position={[-20, 20, -20]} intensity={2} color="#00f2ff" />
            <pointLight position={[20, 20, 20]} intensity={2} color="#ff0055" />

            <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <fog attach="fog" args={['#050505', 10, 250]} />
        </group>
    )
}
