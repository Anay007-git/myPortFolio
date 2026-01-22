import { useRef } from 'react'
import { Stars, Sky } from '@react-three/drei'

export default function Environment() {
    const light = useRef()

    return (
        <group>
            <Sky sunPosition={[100, 20, 100]} inclination={0.6} azimuth={0.1} />
            <ambientLight intensity={0.4} />
            <directionalLight
                ref={light}
                castShadow
                position={[50, 50, 50]}
                intensity={1}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={1000}
                shadow-camera-left={-200}
                shadow-camera-right={200}
                shadow-camera-top={200}
                shadow-camera-bottom={-200}
            />

            {/* Cyberpunk Accents - High Intensity Neon */}
            <pointLight position={[-40, 20, -40]} intensity={10} color="#00f2ff" distance={100} />
            <pointLight position={[40, 20, 40]} intensity={10} color="#ff0055" distance={100} />
            <pointLight position={[0, 30, -80]} intensity={10} color="#ffeb3b" distance={100} />
            <pointLight position={[80, 25, 0]} intensity={10} color="#4caf50" distance={100} />

            <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade speed={1} />
            <fog attach="fog" args={['#050505', 0, 500]} />
        </group>
    )
}
