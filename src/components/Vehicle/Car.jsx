import { useRef, useEffect } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import useGameStore from '../../stores/useGameStore.js'

export default function Car({ position }) {
    const body = useRef()
    const [subscribeKeys, getKeys] = useKeyboardControls()
    const controlMode = useGameStore((state) => state.controlMode)
    const setControlMode = useGameStore((state) => state.setControlMode)

    const carModel = useGLTF('/cyberpunk_car.glb')
    // Enable shadows for the model
    useEffect(() => {
        carModel.scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }, [carModel])

    // Config
    const ACCELERATION = 20
    const BRAKE_POWER = 5
    const TURN_SPEED = 2

    useFrame((state, delta) => {
        if (!body.current) return

        // Only control if in vehicle mode
        if (controlMode !== 'vehicle') return

        const { forward, backward, left, right, interact } = getKeys()

        // --- Movement ---
        // Simple arcade physics: Apply force forward relative to car rotation
        const currentRotation = body.current.rotation()
        const quaternion = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w)

        const forwardDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion)

        let impulse = new THREE.Vector3()
        let torque = new THREE.Vector3()

        if (forward) {
            impulse.add(forwardDirection.multiplyScalar(ACCELERATION * delta))
        }
        if (backward) {
            impulse.sub(forwardDirection.multiplyScalar(ACCELERATION * delta))
        }

        if (left) {
            torque.y += TURN_SPEED * delta
        }
        if (right) {
            torque.y -= TURN_SPEED * delta
        }

        body.current.applyImpulse(impulse, true)
        body.current.applyTorqueImpulse(torque, true)

        // --- Camera Follow Car ---
        const bodyPosition = body.current.translation()
        // Offset behind car
        const cameraOffset = new THREE.Vector3(0, 5, 12).applyQuaternion(quaternion) // Slightly further back for the car model
        const cameraTargetPos = new THREE.Vector3(
            bodyPosition.x + cameraOffset.x,
            bodyPosition.y + cameraOffset.y,
            bodyPosition.z + cameraOffset.z
        )

        state.camera.position.lerp(cameraTargetPos, delta * 2)
        state.camera.lookAt(bodyPosition.x, bodyPosition.y, bodyPosition.z)
    })

    // Interaction check to exit
    useEffect(() => {
        const unsubscribe = subscribeKeys(
            (state) => state.interact,
            (value) => {
                if (value && controlMode === 'vehicle') {
                    setControlMode('character')
                    // TODO: Teleport player to car exit position
                }
            }
        )
        return unsubscribe
    }, [controlMode, setControlMode, subscribeKeys])

    return (
        <RigidBody
            ref={body}
            position={position}
            colliders="cuboid"
            mass={5}
            linearDamping={0.5}
            angularDamping={0.5}
        >
            {/* Visuals */}
            <primitive
                object={carModel.scene}
                scale={1}
                rotation-y={Math.PI} // Adjust if model faces backwards
                position={[0, -1, 0]} // Lower visual to align with collider bottom
            />
        </RigidBody>
    )
}
