import * as THREE from 'three';

import { Sizes } from './Utils/Sizes.js';
import { Time } from './Utils/Time.js';
import { Inputs } from './Inputs.js';
import { Renderer } from './Renderer.js';
import { AudioHandler } from './Utils/AudioHandler.js';
import { World } from './World/World.js';
import { Physics } from './World/Physics.js';
import { PhysicalVehicle } from './World/PhysicalVehicle.js';
import { VisualVehicle } from './World/VisualVehicle.js';

import { Modal } from '../UI/Modal.js';
import { MobileJoystick } from '../UI/MobileJoystick.js';
import { zoneConfig } from '../data/portfolio.js';
import { gsap } from 'gsap';

export class Experience {
    constructor(_options = {}) {
        window.experience = this;

        // Options
        this.canvas = _options.canvas;

        // Setup Utils
        this.sizes = new Sizes();
        this.time = new Time();
        this.audioHandler = new AudioHandler(this);
        this.inputs = new Inputs(); // Formerly Controls

        // Alias for compatibility if needed (some UI might use 'controls')
        this.controls = this.inputs;

        // Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xC4A98A);
        this.scene.fog = new THREE.Fog(0xC4A98A, 30, 80);

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.1, 200);
        this.camera.position.set(0, 25, 30);
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        this.cameraOffset = new THREE.Vector3(0, 15, 25);
        this.cameraLookOffset = new THREE.Vector3(0, 0, -5);
        this.cameraAngle = Math.PI; // Start behind car
        this.cameraHeight = 15;
        this.cameraRadius = 30;

        // Setup Modules in precise order
        this.physics = new Physics(this);
        this.world = new World(this); // Environment, Zones, Static interactions
        this.physicalVehicle = new PhysicalVehicle(this);
        this.visualVehicle = new VisualVehicle(this);
        this.renderer = new Renderer(this);

        // UI Setup
        this.modal = new Modal();
        this.setupMiniMap();

        // Detect Mobile
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024 || ('ontouchstart' in window); // Expanded check
        if (this.isMobile) {
            this.joystick = new MobileJoystick(this);
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) mobileControls.classList.remove('hidden');
        }

        // Global State
        this.isPlaying = false;
        this.currentZone = null;

        // Listeners
        this.sizes.on('resize', () => this.resize());
        this.time.on('tick', () => this.update());

        // Event listeners (UI interaction)
        this.setupEventListeners();
        this.setupStartButton();
        this.hideLoadingScreen();
    }

    resize() {
        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();
        this.renderer.resize();
    }

    // Game Loop - The Core Logic
    update() {
        const deltaTime = this.time.delta; // not used directly mostly, handled by classes

        // 1. Time (handled by Utils/Time trigger)
        // 2. Inputs (handled by Utils/Inputs trigger or pulled)

        // 3. Physics (Update physics world)
        if (this.physics)
            this.physics.update();

        // 4. Physical Vehicle (Update body based on inputs)
        if (this.physicalVehicle)
            this.physicalVehicle.update();

        // 5. Visual Vehicle (Sync mesh with physics)
        if (this.visualVehicle)
            this.visualVehicle.update();

        // 6. World (Animations, Particles, etc.)
        if (this.world)
            this.world.update();

        // 7. View/Camera (Follow vehicle)
        this.updateCamera();

        // 8. Logic (Zone Checks)
        this.checkZoneProximity();
        this.updateMiniMap();

        // 9. Render
        if (this.renderer)
            this.renderer.update();
    }

    updateCamera() {
        if (!this.physicalVehicle || !this.isPlaying) return;

        const vehiclePosition = this.physicalVehicle.position;

        // Calculate Camera Position based on Angle
        const offsetX = Math.sin(this.cameraAngle) * this.cameraRadius;
        const offsetZ = Math.cos(this.cameraAngle) * this.cameraRadius;

        const cameraTarget = new THREE.Vector3(
            vehiclePosition.x + offsetX,
            Math.max(vehiclePosition.y + this.cameraHeight, this.world.ground ? 2 : 2), // Prevent going under ground
            vehiclePosition.z + offsetZ
        );

        // HARD LOCK (Stable Physics)
        this.camera.position.copy(cameraTarget);

        // Look at vehicle
        this.camera.lookAt(vehiclePosition);
    }

    // ... UI Helpers (kept from original) ...

    setupMiniMap() {
        const mapGrid = document.querySelector('.mini-map-grid');
        if (!mapGrid) return;
        zoneConfig.forEach(zone => {
            const marker = document.createElement('div');
            marker.className = 'map-zone';
            marker.style.backgroundColor = `#${zone.color.toString(16).padStart(6, '0')}`;

            // Map Range: +/- 700
            const mapX = ((zone.position.x + 700) / 1400) * 100;
            const mapY = ((zone.position.z + 700) / 1400) * 100;
            marker.style.left = `${mapX}%`;
            marker.style.top = `${mapY}%`;

            // Label
            const label = document.createElement('span');
            label.textContent = zone.name;
            label.style.position = 'absolute';
            label.style.top = '-15px';
            label.style.left = '50%';
            label.style.transform = 'translateX(-50%)';
            label.style.fontSize = '8px';
            label.style.color = '#fff';
            label.style.whiteSpace = 'nowrap';
            label.style.textShadow = '0 0 2px #000';
            marker.appendChild(label);

            mapGrid.appendChild(marker);
        });
        this.mapPlayer = document.getElementById('map-player');
    }

    updateMiniMap() {
        if (!this.mapPlayer || !this.physicalVehicle) return;
        const pos = this.physicalVehicle.position;
        // Map Range: +/- 700
        const mapX = ((pos.x + 700) / 1400) * 100;
        const mapY = ((pos.z + 700) / 1400) * 100;
        this.mapPlayer.style.left = `${Math.max(0, Math.min(100, mapX))}%`;
        this.mapPlayer.style.top = `${Math.max(0, Math.min(100, mapY))}%`;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e' && this.currentZone) {
                this.openZoneModal(this.currentZone);
            }
        });

        // Mouse Look
        window.addEventListener('mousemove', (e) => {
            if (!this.isPlaying) return;
            const sensitivity = 0.005;
            this.cameraAngle -= e.movementX * sensitivity;
            this.cameraHeight += e.movementY * sensitivity * 10;
            this.cameraHeight = Math.max(5, Math.min(40, this.cameraHeight)); // Clamp height
        });
    }

    setupStartButton() {
        const startBtn = document.getElementById('start-btn');
        const instructions = document.getElementById('instructions');
        const hudTop = document.getElementById('hud-top');
        const miniMap = document.getElementById('mini-map');

        startBtn.addEventListener('click', () => {
            instructions.classList.add('hidden');
            this.isPlaying = true;
            if (this.audioHandler) this.audioHandler.resumeContext();

            if (hudTop) {
                hudTop.classList.remove('hud-hidden');
                gsap.fromTo(hudTop, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
            }
            if (miniMap) {
                miniMap.classList.remove('hud-hidden');
                gsap.fromTo(miniMap, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.2 });
            }
            gsap.to(this.camera.position, { duration: 1.5, ease: 'power2.inOut' });
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const progressBar = document.querySelector('.loader-progress-bar');
        gsap.to(progressBar, {
            width: '100%', duration: 1.2, ease: 'power2.out',
            onComplete: () => {
                gsap.to(loadingScreen, {
                    opacity: 0, duration: 0.6,
                    onComplete: () => { loadingScreen.classList.add('hidden'); }
                });
            }
        });
    }

    checkZoneProximity() {
        if (!this.physicalVehicle || !this.isPlaying) return;
        const vehiclePos = this.physicalVehicle.position;
        const zoneIndicator = document.getElementById('zone-indicator');
        const zoneName = zoneIndicator.querySelector('.zone-name');
        const mobileInteractBtn = document.getElementById('mobile-interact-btn');

        let nearestZone = null;
        let nearestDistance = Infinity;

        for (const zone of zoneConfig) {
            const distance = Math.sqrt(Math.pow(vehiclePos.x - zone.position.x, 2) + Math.pow(vehiclePos.z - zone.position.z, 2));
            if (distance < 6 && distance < nearestDistance) {
                nearestDistance = distance;
                nearestZone = zone;
            }
        }

        if (nearestZone && nearestZone !== this.currentZone) {
            this.currentZone = nearestZone;
            zoneName.textContent = `${nearestZone.icon} ${nearestZone.name}`;
            zoneIndicator.classList.remove('hidden');
            if (this.isMobile) {
                mobileInteractBtn.classList.remove('hidden');
                mobileInteractBtn.onclick = () => this.openZoneModal(nearestZone);
            }
        } else if (!nearestZone && this.currentZone) {
            this.currentZone = null;
            zoneIndicator.classList.add('hidden');
            if (this.isMobile) mobileInteractBtn.classList.add('hidden');
        }
    }

    openZoneModal(zone) {
        this.modal.open(zone.id);
    }
}
