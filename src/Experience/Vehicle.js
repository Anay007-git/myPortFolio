import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Vehicle {
    constructor(experience) {
        this.experience = experience;
        this.scene = experience.scene;
        this.physicsWorld = experience.physicsWorld;
        this.controls = null;

        // Vehicle properties
        this.speed = 0;
        this.maxSpeed = 12; // Reduced for better physics
        this.acceleration = 20;
        this.deceleration = 15;
        this.turnSpeed = 2.5;
        this.currentTurn = 0;

        // Audio
        this.audioContext = null;
        this.engineOscillator = null;
        this.engineGain = null;
        this.isAudioStarted = false;

        this.init();
    }

    init() {
        this.createVehicle();
        this.createPhysics();
        this.initAudio();
    }

    // Initialize Web Audio for engine sound
    initAudio() {
        // Audio will start on first user interaction
        document.addEventListener('click', () => this.startAudio(), { once: true });
        document.addEventListener('keydown', () => this.startAudio(), { once: true });
    }

    startAudio() {
        if (this.isAudioStarted) return;
        this.isAudioStarted = true;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create oscillator for engine sound
            this.engineOscillator = this.audioContext.createOscillator();
            this.engineOscillator.type = 'sawtooth';
            this.engineOscillator.frequency.value = 80;

            // Create gain for volume control
            this.engineGain = this.audioContext.createGain();
            this.engineGain.gain.value = 0;

            // Create filter for more realistic engine tone
            this.engineFilter = this.audioContext.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.value = 400;

            // Connect: oscillator -> filter -> gain -> output
            this.engineOscillator.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.audioContext.destination);

            this.engineOscillator.start();
            console.log('Engine sound initialized');
        } catch (e) {
            console.warn('Web Audio not available:', e);
        }
    }

    updateEngineSound() {
        if (!this.engineOscillator || !this.audioContext) return;

        const speedRatio = Math.abs(this.speed) / this.maxSpeed;

        // Frequency: idle at 60Hz, max at 200Hz
        const targetFreq = 60 + speedRatio * 140;
        this.engineOscillator.frequency.setTargetAtTime(targetFreq, this.audioContext.currentTime, 0.1);

        // Volume: quiet at idle, louder when accelerating
        const targetVolume = 0.02 + speedRatio * 0.08;
        this.engineGain.gain.setTargetAtTime(targetVolume, this.audioContext.currentTime, 0.1);

        // Filter gets brighter at higher speeds
        this.engineFilter.frequency.setTargetAtTime(300 + speedRatio * 600, this.audioContext.currentTime, 0.1);
    }

    createVehicle() {
        // Main vehicle group
        this.vehicle = new THREE.Group();

        // ========== LAMBORGHINI-STYLE SPORTS CAR ==========

        // Main body - low and wide
        const bodyShape = new THREE.Shape();
        bodyShape.moveTo(-1.1, 0);
        bodyShape.lineTo(1.1, 0);
        bodyShape.lineTo(1.0, 0.35);
        bodyShape.lineTo(0.7, 0.5);
        bodyShape.lineTo(-0.7, 0.5);
        bodyShape.lineTo(-1.0, 0.35);
        bodyShape.closePath();

        const bodyExtrudeSettings = {
            steps: 1,
            depth: 3.8,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.05,
            bevelSegments: 2
        };

        const bodyGeometry = new THREE.ExtrudeGeometry(bodyShape, bodyExtrudeSettings);
        bodyGeometry.center();
        bodyGeometry.rotateX(Math.PI / 2);

        // Metallic red Lamborghini color
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xff2200,
            roughness: 0.2,
            metalness: 0.9
        });

        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.35;
        body.castShadow = true;
        this.vehicle.add(body);

        // Windshield/Cabin (angular, low)
        const cabinGeometry = new THREE.BoxGeometry(1.6, 0.35, 1.4);
        const cabinMaterial = new THREE.MeshStandardMaterial({
            color: 0x111122,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8
        });

        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 0.72, -0.3);
        cabin.castShadow = true;
        this.vehicle.add(cabin);

        // Spoiler (angular wing)
        const spoilerGeometry = new THREE.BoxGeometry(2.0, 0.08, 0.3);
        const spoilerMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.3,
            metalness: 0.9
        });

        const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
        spoiler.position.set(0, 0.9, -1.7);
        this.vehicle.add(spoiler);

        // Spoiler supports
        const supportGeometry = new THREE.BoxGeometry(0.08, 0.25, 0.08);
        const leftSupport = new THREE.Mesh(supportGeometry, spoilerMaterial);
        leftSupport.position.set(-0.7, 0.78, -1.7);
        this.vehicle.add(leftSupport);

        const rightSupport = new THREE.Mesh(supportGeometry, spoilerMaterial);
        rightSupport.position.set(0.7, 0.78, -1.7);
        this.vehicle.add(rightSupport);

        // Wheels - larger, sportier
        const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 24);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.6,
            metalness: 0.4
        });

        // Wheel rims
        const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.24, 8);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.2,
            metalness: 0.9
        });

        const wheelPositions = [
            { x: -1.0, y: 0.35, z: 1.3 },   // Front left
            { x: 1.0, y: 0.35, z: 1.3 },    // Front right
            { x: -1.0, y: 0.35, z: -1.3 },  // Rear left
            { x: 1.0, y: 0.35, z: -1.3 }    // Rear right
        ];

        this.wheels = [];
        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();

            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheelGroup.add(wheel);

            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheelGroup.add(rim);

            wheelGroup.position.set(pos.x, pos.y, pos.z);
            wheelGroup.castShadow = true;
            this.vehicle.add(wheelGroup);
            this.wheels.push(wheelGroup);
        });

        // Headlights (LED style)
        const headlightGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.05);
        const headlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.6, 0.4, 1.9);
        this.vehicle.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.6, 0.4, 1.9);
        this.vehicle.add(rightHeadlight);

        // Tail lights (LED strip style)
        const tailLightGeometry = new THREE.BoxGeometry(0.9, 0.06, 0.05);
        const tailLightMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });

        const tailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        tailLight.position.set(0, 0.55, -1.9);
        this.vehicle.add(tailLight);

        // Neon underglow (Lamborghini style)
        const underglowGeometry = new THREE.BoxGeometry(2.0, 0.05, 3.6);
        const underglowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6
        });

        const underglow = new THREE.Mesh(underglowGeometry, underglowMaterial);
        underglow.position.y = 0.08;
        this.vehicle.add(underglow);

        // Underglow point light
        this.underglowLight = new THREE.PointLight(0x00ffff, 3, 10);
        this.underglowLight.position.y = 0.2;
        this.vehicle.add(this.underglowLight);

        // Position vehicle
        this.vehicle.position.set(0, 0, 0);
        this.scene.add(this.vehicle);
    }

    createPhysics() {
        // Physics body for the vehicle
        const shape = new CANNON.Box(new CANNON.Vec3(1.1, 0.4, 1.9));
        this.body = new CANNON.Body({
            mass: 600,
            shape: shape,
            position: new CANNON.Vec3(0, 0.5, 0),
            linearDamping: 0.5,
            angularDamping: 0.9
        });

        // Enable CCD for fast-moving objects
        this.body.ccdSpeedThreshold = 1;
        this.body.ccdIterations = 5;

        this.physicsWorld.addBody(this.body);

        // Add collision sound
        this.body.addEventListener('collide', (e) => {
            const relativeVelocity = e.contact.getImpactVelocityAlongNormal();
            if (Math.abs(relativeVelocity) > 2) {
                this.playCrashSound(Math.abs(relativeVelocity));
            }
        });
    }

    playCrashSound(velocity) {
        if (!this.audioContext || !this.isAudioStarted) return;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'square';
        osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);

        // Volume based on impact velocity
        const volume = Math.min(velocity / 20, 0.5);
        gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    setControls(controls) {
        this.controls = controls;
    }

    getPosition() {
        return this.vehicle.position;
    }

    getRotation() {
        return this.vehicle.rotation;
    }

    get isMoving() {
        return Math.abs(this.speed) > 0.1;
    }

    update(deltaTime) {
        if (!this.controls || !this.experience.isPlaying) return;

        const input = this.controls.getInput();

        // Debug: Log every few frames or on movement
        if (input.forward || input.backward || input.left || input.right) {
            this.body.wakeUp();
            console.log('--- Vehicle Debug ---');
            console.log('Speed:', this.speed);
            console.log('Body Pos:', this.body.position);
            console.log('Body Vel:', this.body.velocity);
            console.log('Body Mass:', this.body.mass);
            console.log('Body Type:', this.body.type); // 1 = Dynamic, 2 = Static, 4 = Kinematic (Cannon.js constants might vary, but usually 1 is Dynamic)
        }

        // Acceleration/deceleration
        if (input.forward) {
            this.speed = Math.min(this.speed + this.acceleration * deltaTime, this.maxSpeed);
        } else if (input.backward) {
            this.speed = Math.max(this.speed - this.acceleration * deltaTime, -this.maxSpeed * 0.5);
        } else {
            // Natural deceleration
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - this.deceleration * deltaTime, 0);
            } else if (this.speed < 0) {
                this.speed = Math.min(this.speed + this.deceleration * deltaTime, 0);
            }
        }

        // Turning (only when moving)
        if (Math.abs(this.speed) > 0.5) {
            const turnAmount = this.turnSpeed * deltaTime * (this.speed > 0 ? 1 : -1);

            if (input.left) {
                this.vehicle.rotation.y += turnAmount;
            }
            if (input.right) {
                this.vehicle.rotation.y -= turnAmount;
            }
        }

        // Apply velocity to physics body instead of moving mesh directly
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.vehicle.quaternion);

        // Set physics body velocity (physics engine handles collision!)
        this.body.velocity.x = direction.x * this.speed;
        this.body.velocity.z = direction.z * this.speed;
        this.body.velocity.y = 0; // Keep on ground

        // Keep vehicle on ground
        this.body.position.y = 0.5;

        // Sync mesh position FROM physics body
        this.vehicle.position.x = this.body.position.x;
        this.vehicle.position.y = 0.2; // Fixed height above ground
        this.vehicle.position.z = this.body.position.z;

        // Boundary check
        const boundary = 45;
        if (Math.abs(this.body.position.x) > boundary || Math.abs(this.body.position.z) > boundary) {
            this.body.position.x = Math.max(-boundary, Math.min(boundary, this.body.position.x));
            this.body.position.z = Math.max(-boundary, Math.min(boundary, this.body.position.z));
            this.speed *= 0.5;
        }

        // Animate wheels
        const wheelRotation = this.speed * deltaTime * 3;
        this.wheels.forEach(wheel => {
            wheel.children[0].rotation.x += wheelRotation;
            wheel.children[1].rotation.x += wheelRotation;
        });

        // Animate underglow
        const time = performance.now() * 0.001;
        this.underglowLight.intensity = 3 + Math.sin(time * 4) * 1;

        // Tilt vehicle slightly during turns
        if (input.left || input.right) {
            const targetTilt = (input.left ? 0.08 : -0.08) * Math.min(Math.abs(this.speed) / 5, 1);
            this.vehicle.rotation.z = THREE.MathUtils.lerp(this.vehicle.rotation.z, targetTilt, 0.15);
        } else {
            this.vehicle.rotation.z = THREE.MathUtils.lerp(this.vehicle.rotation.z, 0, 0.1);
        }

        // Update engine sound
        this.updateEngineSound();
    }

    getPosition() {
        return this.vehicle.position;
    }
}
