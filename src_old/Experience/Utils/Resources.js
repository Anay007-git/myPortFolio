import { EventEmitter } from './EventEmitter.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Resources extends EventEmitter {
    constructor(assets) {
        super();

        // Options
        this.assets = assets || [];

        // Setup
        this.items = {};
        this.toLoad = this.assets.length;
        this.loaded = 0;

        this.setLoaders();
        if (this.toLoad === 0) {
            setTimeout(() => this.trigger('ready'), 0);
        } else {
            this.startLoading();
        }
    }

    setLoaders() {
        this.loaders = {};
        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader();
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
    }

    startLoading() {
        for (const asset of this.assets) {
            if (asset.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    asset.path,
                    (file) => this.sourceLoaded(asset, file)
                );
            } else if (asset.type === 'texture') {
                this.loaders.textureLoader.load(
                    asset.path,
                    (file) => this.sourceLoaded(asset, file)
                );
            } else if (asset.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    asset.path,
                    (file) => this.sourceLoaded(asset, file)
                );
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file;
        this.loaded++;

        if (this.loaded === this.toLoad) {
            this.trigger('ready');
        }
    }
}
