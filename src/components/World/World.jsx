import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'

export default function World() {
    const map = useGLTF('/low_poly_city.glb')

    return (
        <group>
            {/* City Map */}
            <RigidBody type="fixed" colliders="trimesh">
                <primitive object={map.scene} scale={1} position={[0, -2, 0]} />
            </RigidBody>

            {/* Fallback Ground (Invisible logic floor if needed, but trimesh usually handles it) */}
            <RigidBody type="fixed" colliders="cuboid" position={[0, -10, 0]}>
                <mesh receiveShadow rotation-x={-Math.PI / 2} scale={1000}>
                    <planeGeometry />
                    <meshStandardMaterial color="#000" />
                </mesh>
            </RigidBody>
        </group>
    )
}
