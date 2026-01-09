import * as THREE from 'three';

export class Renderer {
    constructor(experience) {
        this.experience = experience;
        this.canvas = experience.canvas;
        this.sizes = experience.sizes;
        this.scene = experience.scene;
        this.camera = experience.camera;

        this.setInstance();
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });

        this.instance.physicallyCorrectLights = true; // Legacy, replaced by useLegacyLights = false in newer Three.js but keeping meant for compatibility
        this.instance.outputColorSpace = THREE.SRGBColorSpace;
        this.instance.toneMapping = THREE.CineonToneMapping;
        this.instance.toneMappingExposure = 1.8; // High contrast
        this.instance.shadowMap.enabled = true;
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap;

        this.resize();
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.sizes.pixelRatio);
    }

    update() {
        this.instance.render(this.scene, this.camera);
    }
}
