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
    const setInteractionTarget = useGameStore((state) => state.setInteractionTarget)
    const interactionTarget = useGameStore((state) => state.interactionTarget)

    const carModel = useGLTF('/cyberpunk_car.glb')
    console.log("Car Model Loaded:", carModel)
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
    const ACCELERATION = 40
    const BRAKE_POWER = 10
    const TURN_SPEED = 5
    const MAX_VELOCITY = 20

    useFrame((state, delta) => {
        if (!body.current) return

        const { forward, backward, left, right } = getKeys()

        // --- Interaction Check (Proximity to enter) ---
        if (controlMode === 'character') {
            const bodyPosition = body.current.translation()
            const player = state.scene.getObjectByName('player')

            if (player) {
                const distance = new THREE.Vector3(bodyPosition.x, bodyPosition.y, bodyPosition.z).distanceTo(player.position)
                if (distance < 5) {
                    setInteractionTarget({ type: 'vehicle', id: 'car_primary', label: '[E] ENTER VEHICLE' })
                } else if (interactionTarget?.id === 'car_primary') {
                    setInteractionTarget(null)
                }
            }
        }

        // Only logic below this is for when driving
        if (controlMode !== 'vehicle' || useGameStore.getState().currentVehicleId !== 'car_primary') return

        // --- Driving Physics ---
        const currentRotation = body.current.rotation()
        const quaternion = new THREE.Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w)
        const forwardDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion)

        const velocity = body.current.linvel()
        const currentSpeed = new THREE.Vector3(velocity.x, 0, velocity.z).length()

        let impulse = new THREE.Vector3()
        let torque = new THREE.Vector3()

        if (forward && currentSpeed < MAX_VELOCITY) {
            impulse.add(forwardDirection.multiplyScalar(ACCELERATION * delta))
        }
        if (backward) {
            impulse.sub(forwardDirection.multiplyScalar(BRAKE_POWER * delta))
        }

        if (left && currentSpeed > 1) {
            torque.y += TURN_SPEED * delta * (currentSpeed / MAX_VELOCITY)
        }
        if (right && currentSpeed > 1) {
            torque.y -= TURN_SPEED * delta * (currentSpeed / MAX_VELOCITY)
        }

        body.current.applyImpulse(impulse, true)
        body.current.applyTorqueImpulse(torque, true)

        // --- Camera Follow Car ---
        const bodyPosition = body.current.translation()
        const cameraOffset = new THREE.Vector3(0, 4, -10).applyQuaternion(quaternion)
        const targetCamPos = new THREE.Vector3(
            bodyPosition.x + cameraOffset.x,
            bodyPosition.y + cameraOffset.y,
            bodyPosition.z + cameraOffset.z
        )

        state.camera.position.lerp(targetCamPos, delta * 3)
        state.camera.lookAt(bodyPosition.x, bodyPosition.y + 1, bodyPosition.z)
    })

    // Interaction handling
    useEffect(() => {
        const unsubscribe = subscribeKeys(
            (state) => state.interact,
            (value) => {
                if (value) {
                    const gameState = useGameStore.getState()
                    if (controlMode === 'vehicle' && gameState.currentVehicleId === 'car_primary') {
                        setControlMode('character')
                    } else if (interactionTarget?.id === 'car_primary') {
                        setControlMode('vehicle', 'car_primary')
                    }
                }
            }
        )
        return unsubscribe
    }, [controlMode, interactionTarget, setControlMode, subscribeKeys])

    return (
        <RigidBody
            ref={body}
            name="car_primary"
            position={position}
            colliders="cuboid"
            mass={2}
            linearDamping={0.5}
            angularDamping={2.0}
        >
            {/* Visuals */}
            <primitive
                object={carModel.scene}
                scale={1}
                rotation-y={0}
                position={[0, -0.5, 0]}
            />
        </RigidBody>
    )
}
