import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class PhysicalVehicle {
    constructor(experience) {
        this.experience = experience;
        this.physics = experience.physics;
        this.inputs = experience.inputs;

        // Options
        this.chassisDimensions = new THREE.Vector3(1.0, 0.4, 2.0);
        this.mass = 800;
        this.maxSpeed = 20;
        this.acceleration = 15;
        this.deceleration = 10;
        this.turnSpeed = 2.5;

        // State
        this.speed = 0;
        this.position = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();

        this.engineStarted = false;
        this.createBody();
    }

    createBody() {
        const shape = new CANNON.Box(new CANNON.Vec3(this.chassisDimensions.x, this.chassisDimensions.y, this.chassisDimensions.z));
        this.body = new CANNON.Body({
            mass: this.mass,
            shape: shape,
            position: new CANNON.Vec3(0, 2, 0),
            linearDamping: 0.9, // High damping to stop sliding
            angularDamping: 0.9,
            fixedRotation: true // Manually handle rotation to prevent tipping
        });

        // Use a material with 0 bounce
        this.body.material = this.physics.defaultMaterial;

        // NUCLEAR FIX: Lock Y Axis (Vertical) completely
        // This makes bouncing physically impossible as the engine ignores Y interactions
        this.body.linearFactor = new CANNON.Vec3(1, 0, 1);

        // Force height to be constant
        this.body.position.y = 0.6; // Lowered to touch ground

        this.physics.world.addBody(this.body);
    }

    update() {
        if (!this.body) return;

        const input = this.inputs.getState();
        const dt = this.experience.time.delta * 0.001;

        // -------------------------------------------------------------------------
        // 1. STEERING (Direct Quaternion Rotation - Arcade Style)
        // -------------------------------------------------------------------------
        // We still rotate the body directly for responsive turning, 
        // but we assume the physics solver handles the small overlaps.

        // Calculate speed for turning (we need some speed to turn)
        const localVelocity = new CANNON.Vec3(0, 0, 0);
        this.body.vectorToLocalFrame(this.body.velocity, localVelocity);
        const currentSpeed = localVelocity.z;
        this.speed = currentSpeed; // For audio/visuals

        if (Math.abs(currentSpeed) > 0.5) {
            const turnDir = (input.left ? 1 : 0) - (input.right ? 1 : 0);
            const turnStrength = Math.abs(currentSpeed) > 10 ? this.turnSpeed * 0.5 : this.turnSpeed;

            // Reverse steering if going backward
            const reverseMultiplier = currentSpeed > 0 ? 1 : -1;

            const turnAmount = turnDir * turnStrength * reverseMultiplier * dt;

            const q = new CANNON.Quaternion();
            q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), turnAmount);
            this.body.quaternion = this.body.quaternion.mult(q);
        }

        // -------------------------------------------------------------------------
        // 2. ENGINE FORCE (Physical Push)
        // -------------------------------------------------------------------------
        // We apply a force instead of setting velocity. 
        // This ensures that if we hit a wall, the wall pushes back and we stop.

        const forceMagnitude = 20000; // Mass (800) * Acc (25) approx
        const brakeMagnitude = 2000;

        if (input.forward) {
            this.body.applyLocalForce(new CANNON.Vec3(0, 0, forceMagnitude), new CANNON.Vec3(0, 0, 0));
        } else if (input.backward) {
            this.body.applyLocalForce(new CANNON.Vec3(0, 0, -forceMagnitude * 0.5), new CANNON.Vec3(0, 0, 0));
        } else {
            // Drag / Engine Braking
            const drag = currentSpeed * -200;
            this.body.applyLocalForce(new CANNON.Vec3(0, 0, drag), new CANNON.Vec3(0, 0, 0));
        }

        // -------------------------------------------------------------------------
        // 3. LATERAL GRIP (Synthetic Tire Friction)
        // -------------------------------------------------------------------------
        // Kill sideways velocity to prevent "drift everywhere"
        const sideVelocity = localVelocity.x;
        // Check for drift (handbrake style or just limit)
        // Apply impulse against side velocity
        const gripFactor = 0.9; // 0 = ice, 1 = rails
        const sideImpulse = -sideVelocity * this.body.mass * gripFactor * dt * 60;
        this.body.applyLocalImpulse(new CANNON.Vec3(sideImpulse, 0, 0), new CANNON.Vec3(0, 0, 0));


        // -------------------------------------------------------------------------
        // 4. HOUSEKEEPING
        // -------------------------------------------------------------------------

        // Audio Start
        if (input.forward || input.backward || input.left || input.right) {
            this.body.wakeUp();
            if (!this.engineStarted) {
                this.engineStarted = true;
                if (this.experience.audioHandler) this.experience.audioHandler.startEngine();
            }
        }

        // Engine Sound
        if (this.experience.audioHandler) this.experience.audioHandler.updateEngine(currentSpeed);

        // Sync Visuals
        this.position.copy(this.body.position);
        this.quaternion.copy(this.body.quaternion);

        // Respawn
        if (Math.abs(this.body.position.x) > 2000 || Math.abs(this.body.position.z) > 2000) {
            this.body.velocity.set(0, 0, 0);
            this.body.position.set(0, 0.6, 0);
            this.body.quaternion.set(0, 0, 0, 1);
        }
    }
}
