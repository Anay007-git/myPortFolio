import * as THREE from 'three';

export class VisualVehicle {
    constructor(experience) {
        this.experience = experience;
        this.scene = experience.scene;
        this.physicalVehicle = experience.physicalVehicle;

        this.container = new THREE.Group();
        this.scene.add(this.container);

        this.createCar();
    }

    createCar() {
        const carGroup = new THREE.Group();

        // Materials
        const bodyMat = new THREE.MeshToonMaterial({ color: 0x3366ff }); // Blue sporty color
        const cabinMat = new THREE.MeshToonMaterial({ color: 0x222222 });
        const blackMat = new THREE.MeshToonMaterial({ color: 0x111111 });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
        const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Lower Body
        const mainBody = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.5, 4.0),
            bodyMat
        );
        mainBody.position.y = 0.5;
        mainBody.castShadow = true;
        carGroup.add(mainBody);

        // Upper Cabin
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(1.6, 0.4, 2.0),
            cabinMat
        );
        cabin.position.set(0, 0.95, -0.2);
        cabin.castShadow = true;
        carGroup.add(cabin);

        // Wheel Arches (Simple) - optional, skipping for low poly simplicity

        // Wheels
        this.wheels = [];
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
        const wheelPos = [
            { x: -1.0, z: 1.2 }, { x: 1.0, z: 1.2 },
            { x: -1.0, z: -1.2 }, { x: 1.0, z: -1.2 }
        ];

        wheelPos.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, blackMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.35, pos.z);
            wheel.castShadow = true;
            this.wheels.push(wheel);
            carGroup.add(wheel);
        });

        // Lights
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), lightMat);
        fl.position.set(-0.6, 0.6, 2.0);
        carGroup.add(fl);
        const fr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), lightMat);
        fr.position.set(0.6, 0.6, 2.0);
        carGroup.add(fr);

        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), redMat);
        bl.position.set(-0.6, 0.6, -2.0);
        carGroup.add(bl);
        const br = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), redMat);
        br.position.set(0.6, 0.6, -2.0);
        carGroup.add(br);

        this.container.add(carGroup);
    }

    update() {
        if (!this.physicalVehicle) return;

        // Position Sync
        this.container.position.copy(this.physicalVehicle.position);
        this.container.quaternion.copy(this.physicalVehicle.quaternion);

        // Wheel Rotation
        const speed = this.physicalVehicle.speed || 0;
        this.wheels.forEach(wheel => {
            wheel.rotation.x += speed * 0.1;
        });
    }
}
