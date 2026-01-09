import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Camel {
    constructor(scene, physics, x, z) {
        this.scene = scene;
        this.physics = physics;
        this.initialPosition = new THREE.Vector3(x, 0, z);
        this.container = new THREE.Group();
        this.container.position.set(x, 0, z);

        // Randomize size slightly
        const scale = 0.8 + Math.random() * 0.4;
        this.container.scale.set(scale, scale, scale);

        // Walking speed
        this.speed = 2 + Math.random();
        this.walkOffset = Math.random() * 100;

        this.createBody();
        this.scene.add(this.container);

        // Physics Body (Kinematic because we move it procedurally)
        // CANNON uses half-extents, so we divide dimensions by 2
        const shape = new CANNON.Box(new CANNON.Vec3(
            (1.5 * scale) / 2,
            (2.5 * scale) / 2,
            (1.5 * scale) / 2
        ));
        this.physBody = new CANNON.Body({
            mass: 1000, // Heavy enough to stop car or be pushed slightly? Let's make it static-ish or heavy.
            type: CANNON.Body.KINEMATIC, // We control position
            position: new CANNON.Vec3(x, 2.5, z),
            shape: shape
        });
        this.physics.world.addBody(this.physBody);
    }

    createBody() {
        const material = new THREE.MeshStandardMaterial({
            color: 0xc2b280, // Sand/Camel color
            roughness: 1.0,
            metalness: 0.0
        });

        // Main Body
        const bodyGeo = new THREE.BoxGeometry(1.5, 1.2, 3);
        this.body = new THREE.Mesh(bodyGeo, material);
        this.body.position.y = 2.5;
        this.body.castShadow = true;
        this.container.add(this.body);

        // Humps
        const humpGeo = new THREE.SphereGeometry(0.6, 8, 8);
        const hump1 = new THREE.Mesh(humpGeo, material);
        hump1.position.set(0, 0.8, -0.5);
        this.body.add(hump1);

        const hump2 = new THREE.Mesh(humpGeo, material);
        hump2.position.set(0, 0.8, 0.6);
        this.body.add(hump2);

        // Neck
        const neckGeo = new THREE.BoxGeometry(0.5, 1.5, 0.5);
        const neck = new THREE.Mesh(neckGeo, material);
        neck.position.set(0, 0.8, 1.6);
        neck.rotation.x = -Math.PI / 6;
        this.body.add(neck);

        // Head
        const headGeo = new THREE.BoxGeometry(0.6, 0.6, 1.0);
        const head = new THREE.Mesh(headGeo, material);
        head.position.set(0, 0.8, 0.3);
        neck.add(head);

        // Legs (Pivots)
        this.legs = [];
        const legGeo = new THREE.BoxGeometry(0.3, 2.5, 0.3);

        // FL
        this.legFL = this.createLeg(legGeo, material, 0.5, -0.6, 1.2);
        // FR
        this.legFR = this.createLeg(legGeo, material, -0.5, -0.6, 1.2);
        // BL
        this.legBL = this.createLeg(legGeo, material, 0.5, -0.6, -1.2);
        // BR
        this.legBR = this.createLeg(legGeo, material, -0.5, -0.6, -1.2);

        this.legs = [this.legFL, this.legFR, this.legBL, this.legBR];
    }

    createLeg(geo, mat, x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = -1.25; // Offset so pivot is at top
        mesh.castShadow = true;
        group.add(mesh);
        this.body.add(group);
        return group;
    }

    update(time) {
        const t = time * this.speed + this.walkOffset;

        // Move Forward
        this.container.translateZ(0.03 * this.speed);

        // Simple Loop limits (walking in a large circle or line)
        // Let's just walk straight and reset if too far
        if (this.container.position.z > 2000) {
            this.container.position.z = -2000;
        }

        // Sync Physics Body
        this.physBody.position.set(
            this.container.position.x,
            2.5,
            this.container.position.z
        );
        this.physBody.quaternion.copy(this.container.quaternion);

        // Leg Animation (Sine wave)
        this.legFL.rotation.x = Math.sin(t) * 0.5;
        this.legBR.rotation.x = Math.sin(t) * 0.5;

        this.legFR.rotation.x = Math.sin(t + Math.PI) * 0.5;
        this.legBL.rotation.x = Math.sin(t + Math.PI) * 0.5;

        // Body Bobbing
        this.body.position.y = 2.5 + Math.sin(t * 2) * 0.05;
        this.body.rotation.z = Math.sin(t) * 0.02; // Slight sway
    }
}
