import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { zoneConfig } from '../../data/portfolio.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Camel } from './Camel.js';

export class World {
    constructor(experience) {
        this.experience = experience;
        this.scene = experience.scene;
        this.physics = experience.physics;
        this.audio = experience.audioHandler;

        this.zones = [];
        this.decorations = [];
        this.camels = [];

        this.init();
    }

    init() {
        this.createEnvironment(); // Light, fog, sky
        this.createGround(); // Sand dunes
        this.loadFont();
        this.createZones(); // Oasis zones
        this.createWalls(); // Canyon walls
        this.createDecorations(); // Cacti, Rocks
        this.createWildlife(); // Camels

        // Collsion Sound Listener
        if (this.experience.physicalVehicle && this.experience.physicalVehicle.body) {
            this.experience.physicalVehicle.body.addEventListener('collide', (e) => {
                const relativeVelocity = e.contact.getImpactVelocityAlongNormal();
                if (Math.abs(relativeVelocity) > 2) {
                    if (this.audio) this.audio.play('crash');
                }
            });
        }
    }

    createEnvironment() {
        // Desert Atmosphere - Matching Texture Base
        this.scene.background = new THREE.Color(0xC4A98A);
        this.scene.fog = new THREE.Fog(0xC4A98A, 30, 500); // Increased visibility range

        // Lights (Soft Clay Look)
        const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 0.6);
        this.scene.add(hemiLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        sunLight.position.set(100, 100, 50);
        sunLight.castShadow = true;

        // Soft Shadows
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 500;
        sunLight.shadow.camera.left = -200;
        sunLight.shadow.camera.right = 200;
        sunLight.shadow.camera.top = 200;
        sunLight.shadow.camera.bottom = -200;
        sunLight.shadow.bias = -0.0005;

        this.scene.add(sunLight);
    }

    createGround() {
        // Procedural Sand Texture (Noise)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');

        // Base Color
        context.fillStyle = '#C4A98A'; // Desert Base
        context.fillRect(0, 0, 512, 512);

        // Noise
        const imageData = context.getImageData(0, 0, 512, 512);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const grain = (Math.random() - 0.5) * 30;
            data[i] = Math.min(255, Math.max(0, data[i] + grain));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
        }
        context.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50); // High repeat for grain detail

        // EXPANDED MAP: 4000x4000 (Infinite Feel)
        const geometry = new THREE.PlaneGeometry(4000, 4000);

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: 0xffffff, // Use texture color
            roughness: 0.9, // Very matte like sand
            metalness: 0.0
        });

        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Physics Ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            material: new CANNON.Material({ friction: 0.1, restitution: 0 }) // No bounce
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physics.world.addBody(groundBody);
    }

    loadFont() {
        const loader = new FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
            this.font = font;
            this.createZoneLabels();
        });
    }

    createZones() {
        zoneConfig.forEach(zone => {
            // Oasis Style Zones
            const group = new THREE.Group();
            group.position.set(zone.position.x, 0, zone.position.z);

            // Water Pool
            const waterGeo = new THREE.CircleGeometry(7, 32);
            const waterMat = new THREE.MeshToonMaterial({ color: 0x4fc3f7, opacity: 0.8, transparent: true });
            const water = new THREE.Mesh(waterGeo, waterMat);
            water.rotation.x = -Math.PI / 2;
            water.position.y = 0.2;
            group.add(water);

            // Sand berm around pool
            const bermGeo = new THREE.TorusGeometry(7, 0.5, 8, 32);
            const bermMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
            const berm = new THREE.Mesh(bermGeo, bermMat);
            berm.rotation.x = -Math.PI / 2;
            berm.position.y = 0.2;
            group.add(berm);

            // Palm Trees (Simplified) around zone
            for (let i = 0; i < 3; i++) {
                const ang = (i / 3) * Math.PI * 2 + Math.random();
                const r = 8.5;
                this.createPalmTree(
                    zone.position.x + Math.cos(ang) * r,
                    zone.position.z + Math.sin(ang) * r
                );
            }

            // Floating Marker
            const markerGeo = new THREE.OctahedronGeometry(1.0);
            const markerMat = new THREE.MeshStandardMaterial({ color: zone.color, emissive: zone.color, emissiveIntensity: 2 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.y = 4;
            marker.castShadow = true;
            group.add(marker);

            this.scene.add(group);
            this.zones.push({ group, marker, id: zone.id });
        });
    }

    createZoneLabels() {
        if (!this.font) return;
        zoneConfig.forEach((zone, i) => {
            // Professional 3D Typography
            const geo = new TextGeometry(zone.name, {
                font: this.font,
                size: 5.0, // Reduced from 8.0
                height: 0.8, // Slightly reduced thickness
                curveSegments: 12, // Smoother curves
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.3,
                bevelOffset: 0,
                bevelSegments: 5
            });
            geo.center();

            // Premium Material (White Ceramic / Matte)
            const mat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.4,
                metalness: 0.1,
                emissive: 0xeeeeee,
                emissiveIntensity: 0.2
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(zone.position.x, 12, zone.position.z); // Lowered height
            mesh.lookAt(this.experience.camera.position);
            // Note: looking at camera might be weird if camera moves.
            // Better to just face forward or update in loop.
            // For now, let's just face the center (0,0,0) so they always face the starting player
            mesh.lookAt(0, 12, 0);

            mesh.castShadow = true;
            this.scene.add(mesh);

            this.zones[i].label = mesh;
        });
    }

    createWalls() {
        // Canyon Walls (Bounding box of the world)
        // EXPANDED MAP: Boundary at 700
        const boundary = 700;
        const wallLength = 1500;

        const positions = [
            { x: 0, z: -boundary, r: 0, w: wallLength },
            { x: 0, z: boundary, r: Math.PI, w: wallLength },
            { x: -boundary, z: 0, r: -Math.PI / 2, w: wallLength },
            { x: boundary, z: 0, r: Math.PI / 2, w: wallLength }
        ];

        positions.forEach(pos => {
            // Rough wall generation
            const wallGeo = new THREE.BoxGeometry(pos.w, 80, 40); // Taller walls
            const wallMat = new THREE.MeshStandardMaterial({ color: 0xa1662f, roughness: 1.0 });
            const wall = new THREE.Mesh(wallGeo, wallMat);

            wall.position.set(pos.x, 20, pos.z);
            wall.rotation.y = pos.r;
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);

            // Physics
            const shape = new CANNON.Box(new CANNON.Vec3(pos.w / 2, 40, 20));
            const body = new CANNON.Body({ mass: 0, shape });
            body.position.set(pos.x, 20, pos.z);
            body.quaternion.setFromEuler(0, pos.r, 0);
            this.physics.world.addBody(body);
        });
    }

    createDecorations() {
        // Cacti - More densly populated in the expanded area
        for (let i = 0; i < 300; i++) {
            const x = (Math.random() - 0.5) * 1200; // Spread over 1200x1200
            const z = (Math.random() - 0.5) * 1200;
            // Avoid center start area
            if (Math.sqrt(x * x + z * z) < 40) continue;

            this.createCactus(x, z);
        }

        // Rocks
        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * 1300;
            const z = (Math.random() - 0.5) * 1300;
            if (Math.sqrt(x * x + z * z) < 30) continue;
            this.createRock(x, z, 3 + Math.random() * 5); // Huge rocks only
        }
    }

    createCactus(x, z) {
        const group = new THREE.Group();
        const mat = new THREE.MeshToonMaterial({ color: 0x2e7d32 });

        // Main trunk
        const trunk = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 3, 4, 8), mat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        group.add(trunk);

        // Arms
        if (Math.random() > 0.3) {
            const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.2, 4, 8), mat);
            arm.position.set(0.6, 2.0, 0);
            arm.rotation.z = -Math.PI / 3;
            arm.castShadow = true;
            group.add(arm);
        }
        if (Math.random() > 0.3) {
            const arm2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.0, 4, 8), mat);
            arm2.position.set(-0.6, 2.5, 0);
            arm2.rotation.z = Math.PI / 3;
            arm2.castShadow = true;
            group.add(arm2);
        }

        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI * 2;

        this.scene.add(group);

        // Physics (Cylinder)
        const shape = new CANNON.Cylinder(0.6, 0.6, 3, 8);
        const body = new CANNON.Body({ mass: 0, shape });
        body.position.set(x, 1.5, z);
        this.physics.world.addBody(body);
    }

    createPalmTree(x, z) {
        const group = new THREE.Group();

        // Trunk
        // Use multiple segments for a "bent" look
        const trunkMat = new THREE.MeshToonMaterial({ color: 0x8d6e63 });
        const trunkHeight = 6;
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, trunkHeight, 6);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        group.add(trunk);

        // Leaves
        const leafGeo = new THREE.ConeGeometry(2.5, 1.5, 6);
        const leafMat = new THREE.MeshToonMaterial({ color: 0x43a047 });
        const leaves = new THREE.Mesh(leafGeo, leafMat);
        leaves.position.y = trunkHeight;
        leaves.castShadow = true;
        group.add(leaves);

        const leaves2 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.5, 6), leafMat);
        leaves2.position.y = trunkHeight + 0.8;
        leaves2.castShadow = true;
        group.add(leaves2);

        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI;

        // Slight lean
        group.rotation.z = (Math.random() - 0.5) * 0.2;
        group.rotation.x = (Math.random() - 0.5) * 0.2;

        this.scene.add(group);

        // Physics
        const shape = new CANNON.Cylinder(0.5, 0.5, trunkHeight, 8);
        const body = new CANNON.Body({ mass: 0, shape });
        body.position.set(x, trunkHeight / 2, z);
        this.physics.world.addBody(body);
    }

    createRock(x, z, scale) {
        const rockGeo = new THREE.DodecahedronGeometry(scale, 0);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.9 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(x, scale / 2 - 0.2, z); // buried slightly
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.scale.set(1, 0.6 + Math.random() * 0.4, 1); // Flatten slightly
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);

        // Physics
        const shape = new CANNON.Sphere(scale * 0.9);
        const body = new CANNON.Body({ mass: 0, shape });
        body.position.set(x, scale / 2, z);
        this.physics.world.addBody(body);
    }

    createWildlife() {
        // A lot of camels for the massive world
        for (let i = 0; i < 300; i++) {
            // Random start position spread across the map
            const x = (Math.random() - 0.5) * 3000;
            const z = (Math.random() - 0.5) * 3000;

            // Avoid placing them right on top of the spawn point
            if (Math.abs(x) < 50 && Math.abs(z) < 50) continue;

            const camel = new Camel(this.scene, this.physics, x, z);

            // Random Rotation
            camel.container.rotation.y = Math.random() * Math.PI * 2;

            this.camels.push(camel);
        }
    }

    update() {
        const time = this.experience.time.elapsed * 0.001;

        // Animate Markers
        this.zones.forEach(zone => {
            if (zone.marker) {
                zone.marker.position.y = 4 + Math.sin(time * 2) * 0.5;
                zone.marker.rotation.y += 0.02;
            }
            if (zone.label) {
                zone.label.lookAt(this.experience.camera.position);
            }
        });

        // Update Camels
        this.camels.forEach(camel => camel.update(time));
    }
}
