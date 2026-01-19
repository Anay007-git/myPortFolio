import { RigidBody } from '@react-three/rapier'

export default function World() {
    return (
        <group>
            {/* Ground */}
            <RigidBody type="fixed" colliders="cuboid" friction={2}>
                <mesh receiveShadow position-y={-0.5} scale={100} rotation-x={-Math.PI / 2}>
                    <planeGeometry />
                    <meshStandardMaterial color="#444" />
                </mesh>
            </RigidBody>

            {/* Some Obstacles */}
            <RigidBody position={[5, 1, 5]} colliders="cuboid">
                <mesh castShadow>
                    <boxGeometry />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </RigidBody>

            <RigidBody position={[-5, 1, 5]} colliders="cuboid">
                <mesh castShadow>
                    <sphereGeometry />
                    <meshStandardMaterial color="cyan" />
                </mesh>
            </RigidBody>
        </group>
    )
}
