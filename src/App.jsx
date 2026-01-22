import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, Loader } from '@react-three/drei'
import Experience from './Experience.jsx'
import Navbar from './components/UI/Navbar.jsx'
import GtaHud from './components/UI/GtaHud.jsx'
import MissionOverlay from './components/UI/MissionOverlay.jsx'
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
            <div className="app">
                <div className="scanline"></div>

                {/* 2D UI Layer */}
                <Navbar />
                <GtaHud />
                <MissionOverlay />
                <Interface />

                {/* 3D World Layer */}
                <div className="canvas-container">
                    <Canvas
                        shadows
                        camera={{
                            fov: 45,
                            near: 0.1,
                            far: 2000,
                            position: [25, 25, 25]
                        }}
                    >
                        <color attach="background" args={['#050505']} />
                        <fog attach="fog" args={['#050505', 0, 500]} />

                        <Suspense fallback={null}>
                            <Physics gravity={{ x: 0, y: -9.81, z: 0 }}>
                                <Experience />
                            </Physics>
                        </Suspense>
                    </Canvas>
                </div>
                <Loader />
            </div>
        </KeyboardControls>
    )
}
