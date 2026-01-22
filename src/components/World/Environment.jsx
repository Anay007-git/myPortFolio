import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Environment as DreiEnv, Stars } from '@react-three/drei'

export default function Environment() {
    const light = useRef()

    useFrame((state, delta) => {
        // Simple day/night cycle
        const time = state.clock.getElapsedTime()
        const dayDuration = 60 // Seconds for full cycle
        const progress = (time % dayDuration) / dayDuration

        const sunPos = [
            Math.sin(progress * Math.PI * 2) * 10,
            Math.cos(progress * Math.PI * 2) * 10,
            5
        ]

        if (light.current) {
            light.current.position.set(...sunPos)
            light.current.intensity = Math.max(0, Math.sin(progress * Math.PI) * 2)
        }
    })

    return (
        <group>
            <ambientLight intensity={2.0} />
            <directionalLight
                ref={light}
                castShadow
                shadow-mapSize={[2048, 2048]}
                position={[10, 10, 5]}
            />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            {/* <DreiEnv preset="city" /> */}

            {/* Fog for atmosphere */}
            <fog attach="fog" args={['#202030', 10, 50]} />
        </group>
    )
}
