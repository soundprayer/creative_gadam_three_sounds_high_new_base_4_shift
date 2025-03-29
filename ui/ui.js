// ui.js

/**
 * Toggles play/pause status of oscillators and updates the UI accordingly.
 */
function togglePlay() {
    const playPauseStatus = document.getElementById('playPauseStatus');

    if (!isPaused) {
        // Pause: Stop all oscillators, but don't reset loops
        if (isPlaying1) { osc1.stop(); isPlaying1 = false; }
        if (isPlaying2) { osc2.stop(); isPlaying2 = false; }
        if (isPlaying3) { osc3.stop(); isPlaying3 = false; }
        if (isPlaying4) { osc4.stop(); isPlaying4 = false; }

        isPaused = true;
        playPauseStatus.textContent = 'Graj';
        console.log("⏸️ Pauza – dźwięki wyłączone, loopy czekają");
    } else {
        // Resume: start oscillators and allow loops to continue
        if (iconX1 !== null) { osc1.start(); isPlaying1 = true; }
        if (iconX2 !== null) { osc2.start(); isPlaying2 = true; }
        if (iconX3 !== null) { osc3.start(); isPlaying3 = true; }
        if (iconX4 !== null) { osc4.start(); isPlaying4 = true; }

        isPaused = false;
        playPauseStatus.textContent = 'Odpocząć';
        console.log("▶️ Wznowienie – dźwięki grają, loopy kontynuują");
    }
}

/**
 * Toggles the visibility of the shortcuts modal.
 */
function toggleShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

/**
 * Sets the currently selected sound and updates the UI with visual feedback.
 */
window.addEventListener('DOMContentLoaded', () => {
    window.selectSound = (sound) => {
        selectedSound = sound;
        console.log("Selected sound from menu:", sound);
        const soundButtons = document.querySelectorAll('.sound-option');
        soundButtons.forEach((button, index) => {
            if (index + 1 === selectedSound) {
                button.classList.add('flash');
                setTimeout(() => button.classList.remove('flash'), 500);
            } else {
                button.style.backgroundColor = '';
            }
        });
    };

    // ✅ Attach event listeners after DOM is ready
    document.querySelectorAll('.sound-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const sound = parseInt(btn.dataset.sound);
            window.selectSound(sound);
        });
    });
});

function selectScale(value) {
    scaleType = value;
    window.scaleChanged = true;
    redraw();  // explicitly redraw after changing scale
    setTimeout(() => { window.scaleChanged = false; redraw(); }, 1000);
}

function selectRootNote(value) {
    rootNote = value;
    window.scaleChanged = true;
    redraw();  // explicitly redraw after changing root note
    setTimeout(() => { window.scaleChanged = false; redraw(); }, 1000);
}

// ui.js additions:

window.selectScale = function(scale) {
    scaleType = scale;
    window.scaleChanged = true;  // trigger note line animation
    setTimeout(() => window.scaleChanged = false, 500);
};

window.selectRootNote = function(note) {
    rootNote = note;
    window.scaleChanged = true;  // trigger note line animation
    setTimeout(() => window.scaleChanged = false, 500);
};

window.updateFreqTransitionTime = function(sound, value) {
    freqTransitionTimes[sound] = parseFloat(value);
};