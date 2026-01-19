import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { zoneConfig } from '../data/portfolio.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class World {
    constructor(experience) {
        this.experience = experience;
        this.scene = experience.scene;
        this.physicsWorld = experience.physicsWorld;

        this.zones = [];
        this.decorations = [];

        this.init();
    }

    init() {
        this.createGround();
        this.loadFont();
        this.createZones();
        this.createWalls();
        this.createBowlingPins();
        this.createCrashBoxes();
        this.createEnvironment(); // Trees, water, rocks
        this.createDecorations();
        this.createGrid();
    }

    loadFont() {
        const loader = new FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
            this.font = font;
            this.createAllZoneLabels();
        });
    }

    createGround() {
        // Visual ground - Dirt/Soil for off-road feel
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshToonMaterial({
            color: 0x8B7355, // Dirt brown
        });

        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Physics ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape,
            material: new CANNON.Material()
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.physicsWorld.addBody(groundBody);
    }

    createZones() {
        zoneConfig.forEach(zone => {
            // Zone platform
            const platformGeometry = new THREE.CylinderGeometry(4, 4.5, 0.5, 32);
            const platformMaterial = new THREE.MeshToonMaterial({
                color: zone.color,
            });

            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.set(zone.position.x, 0.25, zone.position.z);
            platform.receiveShadow = true;
            this.scene.add(platform);

            // Glowing ring (keep as Basic for flat color pop)
            const ringGeometry = new THREE.TorusGeometry(4.5, 0.15, 16, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: zone.color,
                transparent: true,
                opacity: 0.8
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(zone.position.x, 0.6, zone.position.z);
            ring.rotation.x = -Math.PI / 2;
            this.scene.add(ring);

            // Floating icon/marker
            const markerGeometry = new THREE.OctahedronGeometry(0.8);
            const markerMaterial = new THREE.MeshToonMaterial({
                color: zone.color,
            });

            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(zone.position.x, 3, zone.position.z);
            marker.castShadow = true;
            this.scene.add(marker);

            this.zones.push({
                platform,
                ring,
                marker,
                config: zone
            });
        });
    }

    createAllZoneLabels() {
        if (!this.font) return;

        zoneConfig.forEach(zone => {
            const textGeometry = new TextGeometry(zone.name, {
                font: this.font,
                size: 1.5,
                height: 0.4,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            });

            textGeometry.center();

            const textMaterial = new THREE.MeshToonMaterial({
                color: zone.color,
            });

            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            // Position above platform - make text face outward
            const yPos = 4;
            textMesh.position.set(zone.position.x, yPos, zone.position.z);
            textMesh.castShadow = true;
            this.scene.add(textMesh);

            // Create Static Physics Body for collision (mass 0 = immovable)
            textGeometry.computeBoundingBox();
            const bbox = textGeometry.boundingBox;
            const width = bbox.max.x - bbox.min.x;
            const height = bbox.max.y - bbox.min.y;
            const depth = 0.6;

            const boxShape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
            const textBody = new CANNON.Body({
                mass: 0, // Static - won't fall or move
                shape: boxShape,
                position: new CANNON.Vec3(zone.position.x, yPos, zone.position.z)
            });

            this.physicsWorld.addBody(textBody);

            // Store for reference (no need to sync since static)
            this.zones[this.zones.length - 1].textMesh = textMesh;
        });
    }

    // Create brick wall obstacles
    createWalls() {
        this.walls = [];

        // Wall configurations: position, rotation, length
        const wallConfigs = [
            // Inner obstacles creating a maze-like path
            { x: -15, z: 0, rotation: 0, length: 12 },
            { x: 15, z: 5, rotation: Math.PI / 4, length: 10 },
            { x: 0, z: -20, rotation: Math.PI / 2, length: 15 },
            { x: 25, z: -15, rotation: 0, length: 8 },
            { x: -25, z: 15, rotation: -Math.PI / 6, length: 10 },
            { x: 10, z: 25, rotation: Math.PI / 3, length: 12 },
            { x: -20, z: -25, rotation: Math.PI / 4, length: 8 },
        ];

        wallConfigs.forEach(config => {
            this.createBrickWall(config.x, config.z, config.rotation, config.length);
        });
    }

    createBrickWall(x, z, rotation, length) {
        const wallGroup = new THREE.Group();

        const brickWidth = 1.2;
        const brickHeight = 0.6;
        const brickDepth = 0.5;
        const wallHeight = 2; // 3-4 bricks high
        const bricksWide = Math.ceil(length / brickWidth);
        const bricksHigh = Math.ceil(wallHeight / brickHeight);

        // Brick colors for variation
        const brickColors = [0x8B4513, 0x9C5221, 0x7A3D0F, 0xA0522D];

        for (let row = 0; row < bricksHigh; row++) {
            // Offset every other row for brick pattern
            const offset = (row % 2) * (brickWidth / 2);

            for (let col = 0; col < bricksWide; col++) {
                const brickGeometry = new THREE.BoxGeometry(
                    brickWidth - 0.05,
                    brickHeight - 0.05,
                    brickDepth
                );

                const colorIndex = Math.floor(Math.random() * brickColors.length);
                const brickMaterial = new THREE.MeshToonMaterial({
                    color: brickColors[colorIndex],
                });

                const brick = new THREE.Mesh(brickGeometry, brickMaterial);
                brick.position.set(
                    col * brickWidth - (length / 2) + offset,
                    row * brickHeight + brickHeight / 2,
                    0
                );
                brick.castShadow = true;
                brick.receiveShadow = true;
                wallGroup.add(brick);
            }
        }

        // Position and rotate the wall group
        wallGroup.position.set(x, 0, z);
        wallGroup.rotation.y = rotation;
        this.scene.add(wallGroup);

        // Add physics body for the wall (thicker than visual for better collision)
        const wallShape = new CANNON.Box(new CANNON.Vec3(length / 2, wallHeight / 2, 1.0));
        const wallBody = new CANNON.Body({
            mass: 0, // Static
            shape: wallShape,
            position: new CANNON.Vec3(x, wallHeight / 2, z)
        });

        // Apply rotation to physics body
        const quaternion = new CANNON.Quaternion();
        quaternion.setFromEuler(0, rotation, 0);
        wallBody.quaternion.copy(quaternion);

        this.physicsWorld.addBody(wallBody);

        this.walls.push({
            mesh: wallGroup,
            body: wallBody
        });
    }

    createBowlingPins() {
        const pinGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const pinMaterial = new THREE.MeshToonMaterial({
            color: 0xffffff,
        });
        const stripeMaterial = new THREE.MeshToonMaterial({
            color: 0xff0000,
        });

        // Bowling alley position
        const startX = 20;
        const startZ = -10;

        // Triangle formation (4 rows: 1, 2, 3, 4 pins)
        let rows = 4;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j <= i; j++) {
                const x = startX + i * 0.5;
                const z = startZ + (j - i / 2) * 0.5;

                // Visual Pin Group
                const pinGroup = new THREE.Group();
                const pin = new THREE.Mesh(pinGeometry, pinMaterial);
                pin.castShadow = true;
                pinGroup.add(pin);

                // Red stripe
                const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.1, 8), stripeMaterial);
                stripe.position.y = 0.15;
                pinGroup.add(stripe);

                pinGroup.position.set(x, 0.3, z);
                this.scene.add(pinGroup);

                // Physics Body
                const pinShape = new CANNON.Cylinder(0.1, 0.1, 0.6, 8);
                const pinBody = new CANNON.Body({
                    mass: 0.5, // Light enough to be knocked over
                    shape: pinShape,
                    position: new CANNON.Vec3(x, 0.3, z)
                });
                pinBody.sleepSpeedLimit = 0.5; // Allow sleeping to save performance

                this.physicsWorld.addBody(pinBody);

                // Link mesh to body for animation
                this.decorations.push({ mesh: pinGroup, body: pinBody });
            }
        }
    }

    createCrashBoxes() {
        // A stack of boxes to crash into
        const boxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const boxMaterial = new THREE.MeshToonMaterial({
            color: 0xf59e0b,
        });

        const startX = -15;
        const startZ = 15;

        // Pyramid stack
        for (let i = 0; i < 3; i++) { // Height
            for (let j = 0; j < 3 - i; j++) { // Width
                const x = startX + j * 0.9 + i * 0.45;
                const y = 0.4 + i * 0.9;
                const z = startZ;

                const box = new THREE.Mesh(boxGeometry, boxMaterial);
                box.position.set(x, y, z);
                box.castShadow = true;
                this.scene.add(box);

                const boxShape = new CANNON.Box(new CANNON.Vec3(0.4, 0.4, 0.4));
                const boxBody = new CANNON.Body({
                    mass: 1,
                    shape: boxShape,
                    position: new CANNON.Vec3(x, y, z)
                });

                this.physicsWorld.addBody(boxBody);
                this.decorations.push({ mesh: box, body: boxBody });
            }
        }
    }

    // Create environmental decorations - Trees, Water, Rocks
    createEnvironment() {
        // ===== LOW-POLY TREES =====
        const treePositions = [
            { x: -35, z: -35 }, { x: -38, z: -30 }, { x: -40, z: -25 },
            { x: 35, z: 35 }, { x: 38, z: 30 }, { x: 40, z: 25 },
            { x: -35, z: 35 }, { x: 35, z: -35 },
            { x: -30, z: -40 }, { x: 30, z: 40 },
            { x: -45, z: 0 }, { x: 45, z: 0 },
            { x: 0, z: -45 }, { x: 0, z: 45 },
        ];

        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z);
        });

        // ===== WATER POND =====
        this.createWaterPond(-30, -10, 8);

        // ===== ROCKS =====
        const rockPositions = [
            { x: -25, z: -30, scale: 1.5 },
            { x: 28, z: 32, scale: 2 },
            { x: -38, z: 20, scale: 1 },
            { x: 40, z: -20, scale: 1.8 },
        ];

        rockPositions.forEach(rock => {
            this.createRock(rock.x, rock.z, rock.scale);
        });
    }

    createTree(x, z) {
        const treeGroup = new THREE.Group();

        // Trunk - Brown cylinder
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 6);
        const trunkMaterial = new THREE.MeshToonMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        // Foliage - Green cone (low-poly)
        const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 6);
        const foliageMaterial = new THREE.MeshToonMaterial({ color: 0x228B22 });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = 3.5;
        foliage.castShadow = true;
        treeGroup.add(foliage);

        // Second layer of foliage
        const foliage2Geometry = new THREE.ConeGeometry(1.2, 2.5, 6);
        const foliage2 = new THREE.Mesh(foliage2Geometry, foliageMaterial);
        foliage2.position.y = 5;
        foliage2.castShadow = true;
        treeGroup.add(foliage2);

        // Random scale variation
        const scale = 0.8 + Math.random() * 0.6;
        treeGroup.scale.set(scale, scale, scale);
        treeGroup.position.set(x, 0, z);
        treeGroup.rotation.y = Math.random() * Math.PI * 2;

        this.scene.add(treeGroup);

        // Physics body for tree trunk
        const treeShape = new CANNON.Cylinder(0.4, 0.4, 2 * scale, 6);
        const treeBody = new CANNON.Body({
            mass: 0, // Static
            shape: treeShape,
            position: new CANNON.Vec3(x, scale, z)
        });
        this.physicsWorld.addBody(treeBody);
    }

    createWaterPond(x, z, radius) {
        // Water surface
        const waterGeometry = new THREE.CircleGeometry(radius, 32);
        const waterMaterial = new THREE.MeshToonMaterial({
            color: 0x4169E1,
            transparent: true,
            opacity: 0.8
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(x, 0.05, z);
        water.receiveShadow = true;
        this.scene.add(water);

        // Shore/edge
        const shoreGeometry = new THREE.TorusGeometry(radius, 0.3, 8, 32);
        const shoreMaterial = new THREE.MeshToonMaterial({ color: 0xD2B48C });
        const shore = new THREE.Mesh(shoreGeometry, shoreMaterial);
        shore.rotation.x = -Math.PI / 2;
        shore.position.set(x, 0.1, z);
        this.scene.add(shore);
    }

    createRock(x, z, scale) {
        // Low-poly rock using icosahedron
        const rockGeometry = new THREE.IcosahedronGeometry(1, 0);
        const rockMaterial = new THREE.MeshToonMaterial({ color: 0x808080 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        rock.position.set(x, scale * 0.5, z);
        rock.scale.set(scale, scale * 0.7, scale);
        rock.rotation.set(Math.random(), Math.random(), Math.random());
        rock.castShadow = true;
        rock.receiveShadow = true;
        this.scene.add(rock);

        // Physics body
        const rockShape = new CANNON.Sphere(scale * 0.6);
        const rockBody = new CANNON.Body({
            mass: 0,
            shape: rockShape,
            position: new CANNON.Vec3(x, scale * 0.5, z)
        });
        this.physicsWorld.addBody(rockBody);
    }

    createDecorations() {
        // Create scattered cubes as decorations
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const colors = [0x00d4ff, 0x7c3aed, 0xf59e0b, 0x10b981];

        for (let i = 0; i < 30; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const cubeMaterial = new THREE.MeshToonMaterial({
                color: color,
            });

            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

            // Random position (avoiding zones)
            let x, z;
            do {
                x = (Math.random() - 0.5) * 80;
                z = (Math.random() - 0.5) * 80;
            } while (this.isNearZone(x, z, 8));

            const scale = 0.3 + Math.random() * 0.7;
            cube.scale.set(scale, scale * (1 + Math.random()), scale);
            cube.position.set(x, scale / 2, z);
            cube.rotation.y = Math.random() * Math.PI * 2;
            cube.castShadow = true;
            cube.receiveShadow = true;

            this.scene.add(cube);
            this.decorations.push({
                mesh: cube,
                rotationSpeed: (Math.random() - 0.5) * 0.5
            });
        }

        // Create floating particles
        this.createParticles();
    }

    isNearZone(x, z, minDistance) {
        for (const zone of zoneConfig) {
            const distance = Math.sqrt(
                Math.pow(x - zone.position.x, 2) +
                Math.pow(z - zone.position.z, 2)
            );
            if (distance < minDistance) return true;
        }
        return false;
    }

    createParticles() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorOptions = [
            new THREE.Color(0x00d4ff),
            new THREE.Color(0x7c3aed),
            new THREE.Color(0xf59e0b)
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = Math.random() * 20 + 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    createGrid() {
        // Subtle grid on ground
        const gridHelper = new THREE.GridHelper(100, 50, 0x1a1a2e, 0x1a1a2e);
        gridHelper.position.y = 0.01;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        this.scene.add(gridHelper);
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;

        // Animate zones
        this.zones.forEach((zone, index) => {
            // Rotate marker
            zone.marker.rotation.y += deltaTime * 0.5;
            zone.marker.position.y = 3 + Math.sin(time * 2 + index) * 0.3;

            // Pulse ring
            const pulse = 1 + Math.sin(time * 3 + index) * 0.1;
            zone.ring.scale.set(pulse, pulse, 1);
        });

        // Animate decorations
        this.decorations.forEach(dec => {
            if (dec.body) {
                // Sync mesh with physics body for dynamic objects
                dec.mesh.position.copy(dec.body.position);
                dec.mesh.quaternion.copy(dec.body.quaternion);
            } else if (dec.rotationSpeed) {
                // Static floating animations for background objects
                dec.mesh.rotation.y += dec.rotationSpeed * deltaTime;
            }
        });

        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += deltaTime * 0.02;
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + positions[i]) * 0.002;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
}
