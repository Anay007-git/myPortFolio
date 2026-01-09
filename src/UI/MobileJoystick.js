export class MobileJoystick {
    constructor(experience) {
        this.experience = experience;
        this.controls = experience.controls;

        this.container = document.getElementById('joystick-container');
        this.base = document.getElementById('joystick-base');
        this.stick = document.getElementById('joystick-stick');

        this.baseRect = null;
        this.centerX = 0;
        this.centerY = 0;
        this.maxDistance = 35;

        this.currentX = 0;
        this.currentY = 0;
        this.isActive = false;

        this.init();
    }

    init() {
        // Touch events
        this.base.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.base.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.base.addEventListener('touchend', (e) => this.onTouchEnd(e));
        this.base.addEventListener('touchcancel', (e) => this.onTouchEnd(e));

        // Mouse events for testing on desktop
        this.base.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    }

    updateBaseRect() {
        this.baseRect = this.base.getBoundingClientRect();
        this.centerX = this.baseRect.left + this.baseRect.width / 2;
        this.centerY = this.baseRect.top + this.baseRect.height / 2;
    }

    onTouchStart(e) {
        e.preventDefault();
        this.isActive = true;
        this.updateBaseRect();
        this.handleInput(e.touches[0].clientX, e.touches[0].clientY);
    }

    onTouchMove(e) {
        e.preventDefault();
        if (!this.isActive) return;
        this.handleInput(e.touches[0].clientX, e.touches[0].clientY);
    }

    onTouchEnd(e) {
        this.isActive = false;
        this.resetStick();
    }

    onMouseDown(e) {
        this.isActive = true;
        this.updateBaseRect();
        this.handleInput(e.clientX, e.clientY);
    }

    onMouseMove(e) {
        if (!this.isActive) return;
        this.handleInput(e.clientX, e.clientY);
    }

    onMouseUp(e) {
        this.isActive = false;
        this.resetStick();
    }

    handleInput(clientX, clientY) {
        // Calculate offset from center
        let deltaX = clientX - this.centerX;
        let deltaY = clientY - this.centerY;

        // Calculate distance
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Clamp to max distance
        if (distance > this.maxDistance) {
            deltaX = (deltaX / distance) * this.maxDistance;
            deltaY = (deltaY / distance) * this.maxDistance;
        }

        // Update stick position
        this.stick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // Normalize values (-1 to 1)
        this.currentX = deltaX / this.maxDistance;
        this.currentY = deltaY / this.maxDistance;

        // Send to controls
        if (this.controls) {
            this.controls.setJoystickInput(this.currentX, this.currentY);
        }
    }

    resetStick() {
        this.stick.style.transform = 'translate(0, 0)';
        this.currentX = 0;
        this.currentY = 0;

        if (this.controls) {
            this.controls.setJoystickInput(0, 0);
        }
    }
}
