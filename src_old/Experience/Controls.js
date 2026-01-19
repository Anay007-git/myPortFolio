export class Controls {
    constructor(experience) {
        this.experience = experience;
        this.vehicle = experience.vehicle;

        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // Joystick input (for mobile)
        this.joystickInput = {
            x: 0,
            y: 0
        };

        this.init();
    }

    init() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Connect to vehicle
        if (this.vehicle) {
            this.vehicle.setControls(this);
        }
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
        this.joystickInput.x = x;
        this.joystickInput.y = y;
    }

    getInput() {
        // Combine keyboard and joystick input
        const threshold = 0.2;

        return {
            forward: this.keys.forward || this.joystickInput.y < -threshold,
            backward: this.keys.backward || this.joystickInput.y > threshold,
            left: this.keys.left || this.joystickInput.x < -threshold,
            right: this.keys.right || this.joystickInput.x > threshold
        };
    }
}
