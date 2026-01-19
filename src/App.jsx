import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, Loader } from '@react-three/drei'
import Experience from './Experience.jsx'
import Interface from './components/UI/Interface.jsx'

export default function App() {
    return (
        <KeyboardControls
            map={[
                { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
                { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
                { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
                { name: 'right', keys: ['ArrowRight', 'KeyD'] },
                { name: 'jump', keys: ['Space'] },
                { name: 'run', keys: ['Shift'] },
                { name: 'interact', keys: ['KeyE', 'KeyF'] },
            ]}
        >
            <Interface />
            <Canvas
                shadows
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 200,
                    position: [2.5, 4, 6]
                }}
            >
                <color attach="background" args={['#201919']} />

                <Suspense fallback={null}>
                    <Physics debug={window.location.hash.includes('debug')}>
                        <Experience />
                    </Physics>
                </Suspense>
            </Canvas>
            <Loader />
        </KeyboardControls>
    )
}
