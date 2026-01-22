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
        console.log("Player Animations:", animations.map(a => a.name))
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

    const controlMode = useGameStore((state) => state.controlMode)

    const cameraOffset = new THREE.Vector3(0, 5, 8)
    const cameraTarget = new THREE.Vector3()

    useFrame((state, delta) => {
        if (!body.current || controlMode !== 'character') return

        const { forward, backward, left, right, jump, run } = getKeys()

        // --- Camera Relative Movement ---
        const velocity = body.current.linvel()

        // Get camera basis
        const cameraRotation = new THREE.Euler().setFromQuaternion(state.camera.quaternion, 'YXZ')
        const forwardVector = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, cameraRotation.y, 0))
        const rightVector = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, cameraRotation.y, 0))

        const moveDirection = new THREE.Vector3()
        if (forward) moveDirection.add(forwardVector)
        if (backward) moveDirection.sub(forwardVector)
        if (right) moveDirection.add(rightVector)
        if (left) moveDirection.sub(rightVector)

        moveDirection.normalize()

        const speed = run ? RUN_SPEED : MOVEMENT_SPEED
        const desiredVelocity = moveDirection.multiplyScalar(speed)

        // Apply movement physics
        body.current.setLinvel({
            x: desiredVelocity.x,
            y: velocity.y,
            z: desiredVelocity.z
        }, true)

        // --- Rotation (Face movement direction) ---
        if (moveDirection.length() > 0.1) {
            const targetRotation = Math.atan2(moveDirection.x, moveDirection.z)
            const currentRotation = group.current.rotation.y

            // Shortest path rotation
            let diff = targetRotation - currentRotation
            while (diff < -Math.PI) diff += Math.PI * 2
            while (diff > Math.PI) diff -= Math.PI * 2

            group.current.rotation.y += diff * delta * ROTATION_SPEED
        }

        // --- Smooth Camera Follow (GTA Style) ---
        const bodyPosition = body.current.translation()
        const targetCamPos = new THREE.Vector3(
            bodyPosition.x + cameraOffset.x,
            bodyPosition.y + cameraOffset.y,
            bodyPosition.z + cameraOffset.z
        )

        // Dynamic FOV for speed feel
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, run && moveDirection.length() > 0.1 ? 55 : 45, delta * 2)
        state.camera.updateProjectionMatrix()

        state.camera.position.lerp(targetCamPos, delta * 3)
        cameraTarget.lerp(new THREE.Vector3(bodyPosition.x, bodyPosition.y + 1, bodyPosition.z), delta * 5)
        state.camera.lookAt(cameraTarget)

        // --- Animation Logic ---
        const isMoving = moveDirection.length() > 0.1
        let actionName = 'Idle'
        if (isMoving) {
            actionName = run ? 'Run' : 'Walk'
        }

        // Apply animations (safely handle missing clips)
        const activeAction = actions[actionName] || actions['Walking'] || actions['Running'] || actions['Idle'] || actions['A-pose']

        if (activeAction) {
            // Fade out others
            Object.values(actions).forEach(action => {
                if (action !== activeAction && action.isRunning()) action.fadeOut(0.2)
            })
            activeAction.reset().fadeIn(0.2).play()
        } else {
            // If no animations found, ensure we log it only once
            // (Current log in useEffect handles this)
        }

        updatePlayer(
            { x: bodyPosition.x, y: bodyPosition.y, z: bodyPosition.z },
            { x: 0, y: group.current.rotation.y, z: 0, w: 1 },
            actionName
        )

        // --- Jump ---
        if (jump && Math.abs(velocity.y) < 0.1) {
            body.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true)
            if (actions['Jump']) actions['Jump'].play()
        }
    })

    return (
        <RigidBody
            ref={body}
            name="player"
            colliders={false}
            enabledRotations={[false, true, false]}
            position={[0, 5, 0]}
            linearDamping={0.5}
        >
            <CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />

            <group ref={group} position={[0, 0, 0]}>
                <primitive object={scene} scale={0.5} position={[0, 0, 0]} />
            </group>
        </RigidBody>
    )
}

useGLTF.preload('/cyberpunk_character.glb')

