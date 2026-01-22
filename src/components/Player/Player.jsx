import { useKeyboardControls, useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, vec3 } from '@react-three/rapier'
import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import useGameStore from '../../stores/useGameStore.js'
import useMultiplayer from '../../hooks/useMultiplayer.js'

export default function Player() {
    const body = useRef()
    const group = useRef()
    const [subscribeKeys, getKeys] = useKeyboardControls()

    // Load Model
    const { scene, animations } = useGLTF('/cyberpunk_character.glb')
    const { actions } = useAnimations(animations, group)

    // DEBUG: Log animations to find correct names
    useEffect(() => {
        console.log("Available Animations:", animations.map(a => a.name))
    }, [animations])

    // Multiplayer Hook
    const { updatePlayer } = useMultiplayer()

    // Config
    const MOVEMENT_SPEED = 5
    const RUN_SPEED = 8
    const JUMP_FORCE = 5
    const ROTATION_SPEED = 5

    // Cast shadows
    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
            }
        })
    }, [scene])

    useFrame((state, delta) => {
        if (!body.current) return

        const { forward, backward, left, right, jump, run } = getKeys()

        // --- Movement ---
        const velocity = body.current.linvel()
        const cameraDirection = new THREE.Vector3()
        state.camera.getWorldDirection(cameraDirection)
        cameraDirection.y = 0
        cameraDirection.normalize()

        const cameraRight = new THREE.Vector3()
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

        const moveDirection = new THREE.Vector3()
        if (forward) moveDirection.add(cameraDirection)
        if (backward) moveDirection.sub(cameraDirection)
        if (right) moveDirection.add(cameraRight)
        if (left) moveDirection.sub(cameraRight)

        moveDirection.normalize()

        const speed = run ? RUN_SPEED : MOVEMENT_SPEED
        const desiredVelocity = moveDirection.multiplyScalar(speed)

        body.current.setLinvel({
            x: desiredVelocity.x,
            y: velocity.y,
            z: desiredVelocity.z
        }, true)

        // --- Rotation ---
        let currentRotationQuat = body.current.rotation()

        if (moveDirection.length() > 0.1) {
            const currentRotation = new THREE.Quaternion(
                currentRotationQuat.x,
                currentRotationQuat.y,
                currentRotationQuat.z,
                currentRotationQuat.w
            )

            const targetRotation = new THREE.Quaternion()
            targetRotation.setFromUnitVectors(new THREE.Vector3(0, 0, 1), moveDirection.normalize())

            const smoothRotation = currentRotation.slerp(targetRotation, ROTATION_SPEED * delta)
            body.current.setRotation(smoothRotation, true)

            currentRotationQuat = smoothRotation

            // Rotate visual group to face forward if needed, but usually we rotate rigidbody. 
            // If the model is facing wrong way, rotate the primitive below.
        }

        // --- Animation Logic ---
        // Protocol: 'Run' | 'Walk' | 'Idle'
        // Model only has: ['A-pose']

        const isMoving = moveDirection.length() > 0.1

        // Since we only have 'A-pose', we ensure it plays to avoid T-pose/static.
        if (actions['A-pose']) {
            actions['A-pose'].reset().fadeIn(0.2).play()
        } else if (animations.length > 0) {
            // General fallback
            actions[animations[0].name].reset().fadeIn(0.2).play()
        }

        // --- Jump ---
        if (jump && Math.abs(velocity.y) < 0.1) {
            body.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
        }

        // --- Camera Follow ---
        const bodyPosition = body.current.translation()

        state.camera.position.x += (bodyPosition.x + 2.5 - state.camera.position.x) * delta * 2
        state.camera.position.z += (bodyPosition.z + 6 - state.camera.position.z) * delta * 2
        state.camera.lookAt(bodyPosition.x, bodyPosition.y + 1, bodyPosition.z)

        // --- Network Update ---
        let actionName = 'Idle'
        if (isMoving) {
            actionName = run ? 'Run' : 'Walk'
        }

        updatePlayer(
            { x: bodyPosition.x, y: bodyPosition.y, z: bodyPosition.z },
            { x: currentRotationQuat.x, y: currentRotationQuat.y, z: currentRotationQuat.z, w: currentRotationQuat.w },
            actionName
        )
    })

    return (
        <RigidBody
            ref={body}
            colliders={false}
            enabledRotations={[false, true, false]}
            position={[0, 5, 0]} // Higher spawn
            linearDamping={0.5}
        >
            <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />

            <group ref={group} position={[0, 0, 0]}>
                <primitive object={scene} scale={1} position={[0, 0, 0]} />
            </group>
        </RigidBody>
    )
}
