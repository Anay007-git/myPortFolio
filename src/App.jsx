import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Physics } from '@react-three/rapier'
import { KeyboardControls, Loader } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import Experience from './Experience.jsx'
import Navbar from './components/UI/Navbar.jsx'
import GtaHud from './components/UI/GtaHud.jsx'
import MissionOverlay from './components/UI/MissionOverlay.jsx'
import Interface from './components/UI/Interface.jsx'
import MusicPlayer from './components/UI/MusicPlayer.jsx'

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
                <GtaHud />
                <MissionOverlay />
                <Interface />
                <MusicPlayer />

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
                            <Physics gravity={[0, -9.81, 0]}>
                                <Experience />
                            </Physics>
                        </Suspense>

                        <EffectComposer disableNormalPass>
                            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
                            <ChromaticAberration offset={[0.002, 0.002]} />
                            <Vignette eskil={false} offset={0.1} darkness={0.7} />
                        </EffectComposer>
                    </Canvas>
                </div>
                <Loader />
            </div>
        </KeyboardControls>
    )
}
