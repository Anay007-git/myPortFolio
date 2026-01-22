import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'
import { useEffect } from 'react'
import * as THREE from 'three'

export default function World() {
    const map = useGLTF('/low_poly_city.glb')
    console.log("City Model Loaded:", map)

    // Fix materials - enable double-sided rendering and ensure visibility
    useEffect(() => {
        map.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material) {
                    child.material.side = THREE.DoubleSide
                    child.material.needsUpdate = true
                }
            }
        })
    }, [map])

    return (
        <group>
            {/* City Map */}
            <RigidBody type="fixed" colliders="trimesh">
                {/* Scaled up seeing as it was invisible/small */}
                <primitive object={map.scene} scale={10} position={[0, 0, 0]} />
            </RigidBody>

            {/* Fallback Ground (Visible for debugging) */}
            <RigidBody type="fixed" colliders="cuboid" position={[0, -0.5, 0]}>
                <mesh receiveShadow rotation-x={-Math.PI / 2} scale={500}>
                    <planeGeometry />
                    <meshStandardMaterial color="green" />
                </mesh>
            </RigidBody>
        </group>
    )
}
