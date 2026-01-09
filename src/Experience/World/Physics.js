import * as CANNON from 'cannon-es';

export class Physics {
    constructor(experience) {
        this.experience = experience;
        this.time = experience.time;

        // Setup
        this.world = new CANNON.World();
        this.world.gravity.set(0, -30, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.world.solver.iterations = 10;

        // Materials
        this.defaultMaterial = new CANNON.Material('default');
        this.defaultContactMaterial = new CANNON.ContactMaterial(
            this.defaultMaterial,
            this.defaultMaterial,
            {
                friction: 0.5, // Added friction to stop sliding
                restitution: 0.0 // No bounce
            }
        );
        this.world.addContactMaterial(this.defaultContactMaterial);
        this.world.defaultContactMaterial = this.defaultContactMaterial;
    }

    update() {
        // Fixed timestep for stable physics (60 FPS)
        this.world.step(1 / 60, this.time.delta * 0.001, 3);
    }
}
