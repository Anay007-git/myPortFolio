export class AudioHandler {
    constructor(experience) {
        this.experience = experience;
        this.camera = experience.camera;

        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.context.destination);

        this.sounds = {};
        this.setupSounds();

        // Resume context on user interaction
        ['click', 'keydown', 'touchstart'].forEach(event => {
            window.addEventListener(event, () => this.resumeContext(), { once: true });
        });
    }

    resumeContext() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    async setupSounds() {
        // Engine sound (Synthesized)
        this.engineOsc = this.context.createOscillator();
        this.engineGain = this.context.createGain();

        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 60;

        this.engineGain.gain.value = 0;

        // Lowpass filter for muffling
        this.engineFilter = this.context.createBiquadFilter();
        this.engineFilter.type = 'lowpass';
        this.engineFilter.frequency.value = 400;

        this.engineOsc.connect(this.engineFilter);
        this.engineFilter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineOsc.start();
    }

    startEngine() {
        this.resumeContext();
        this.engineGain.gain.setTargetAtTime(0.1, this.context.currentTime, 0.5);
    }

    updateEngine(speed) {
        if (!this.engineOsc) return;
        const speedRatio = Math.min(Math.abs(speed) / 20, 1);

        // Pitch modulation
        this.engineOsc.frequency.setTargetAtTime(60 + speedRatio * 150, this.context.currentTime, 0.1);

        // Volume modulation (idle rumble vs revving)
        // this.engineGain.gain.setTargetAtTime(0.05 + speedRatio * 0.1, this.context.currentTime, 0.1);
    }

    playCrash() {
        // Synthesized Crash (White noise burst)
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        // White noise buffer
        const bufferSize = this.context.sampleRate * 0.5; // 0.5s
        const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.context.createBufferSource();
        noise.buffer = buffer;

        // Filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.context.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.3);

        // Envelope
        gain.gain.setValueAtTime(1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        noise.stop(this.context.currentTime + 0.4);
    }

    playClick() {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.context.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }
}
