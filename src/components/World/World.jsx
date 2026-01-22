import { RigidBody } from '@react-three/rapier'
import { useGLTF } from '@react-three/drei'

export default function World() {
    const map = useGLTF('/low_poly_city.glb')
    console.log("City Model Loaded:", map)

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
