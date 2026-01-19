import { Experience } from './Experience/Experience.js';

// Initialize the 3D experience when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the main experience
    window.experience = new Experience({
        canvas: document.getElementById('experience-canvas')
    });
});
