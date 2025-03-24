// sketch.js
function setup() {
    createCanvas(windowWidth, 400);
    setupOscillators();
    setupReverb();
    getAudioContext().resume();
}

function draw() {
    background(0);

    // Draw semitransparent red vertical lines for notes
    drawNoteLines();

    // Highlight selected sound
    highlightSelectedSound();

    // Handle mouse interactions and sound updates
    handleMouseInteractions();

    // Draw frequency text
    drawFrequencyText();

    // Draw visual particle effects
    drawParticleEffects();

    // Draw sound icons
    drawSoundIcons();

    // Update play/pause status
    updatePlayPauseStatus();

    // Update loops
    updateAllLoops();

    // Overdub handling (if active)
    handleOverdub();
}

function windowResized() {
    resizeCanvas(windowWidth, 400);
}
