import { EventEmitter } from './Utils/EventEmitter.js';

export class Inputs extends EventEmitter {
    constructor() {
        super();

        // Setup
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        this.joystick = {
            x: 0,
            y: 0
        };

        // Event listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = true;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = true;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = true;
                break;
        }
    }

    onKeyUp(e) {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.keys.forward = false;
                break;
            case 's':
            case 'arrowdown':
                this.keys.backward = false;
                break;
            case 'a':
            case 'arrowleft':
                this.keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.keys.right = false;
                break;
        }
    }

    setJoystickInput(x, y) {
        this.joystick.x = x;
        this.joystick.y = y;
        this.trigger('input');
    }

    getState() {
        // Combine keyboard and joystick input
        const threshold = 0.2;

        return {
            forward: this.keys.forward || this.joystick.y < -threshold,
            backward: this.keys.backward || this.joystick.y > threshold,
            left: this.keys.left || this.joystick.x < -threshold,
            right: this.keys.right || this.joystick.x > threshold
        };
    }
}
