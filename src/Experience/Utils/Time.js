import { EventEmitter } from './EventEmitter.js';

export class Time extends EventEmitter {
    constructor() {
        super();

        // Setup
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;
        this.playing = true;

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }

    tick() {
        const currentTime = Date.now();
        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;

        this.trigger('tick');

        if (this.playing) // added playing check for pause capability
            window.requestAnimationFrame(() => {
                this.tick();
            });
    }

    stop() {
        this.playing = false;
    }

    play() {
        if (!this.playing) {
            this.playing = true;
            this.current = Date.now(); // Reset current on resume to avoid huge delta
            this.tick();
        }
    }
}
