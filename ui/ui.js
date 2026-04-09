// ui.js

function togglePlay() {
    const playPauseStatus = document.getElementById('playPauseStatus');

    if (!isPaused) {
        soundSlots.forEach((slot, index) => {
            if (slot.isPlaying) {
                oscillators[index].stop();
                slot.isPlaying = false;
            }
        });

        isPaused = true;
        playPauseStatus.textContent = 'Graj';
        if (debugMode) console.log('⏸️ Pauza – dźwięki wyłączone, loopy czekają');
    } else {
        soundSlots.forEach((slot, index) => {
            if (slot.iconX !== null) {
                oscillators[index].start();
                slot.isPlaying = true;
            }
        });

        isPaused = false;
        playPauseStatus.textContent = 'Odpocząć';
        if (debugMode) console.log('▶️ Wznowienie – dźwięki grają, loopy kontynuują');
    }
}

function toggleShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function selectSound(sound) {
    selectedSound = sound;
    const soundButtons = document.querySelectorAll('.sound-option');
    soundButtons.forEach((button, index) => {
        if (index + 1 === selectedSound) {
            button.classList.add('flash');
            setTimeout(() => button.classList.remove('flash'), 500);
        } else {
            button.style.backgroundColor = '';
        }
    });
}

function bindScaleAndReverbGlobals() {
    window.selectScale = function (scale) {
        scaleType = scale;
        window.scaleChanged = true;
        setTimeout(() => {
            window.scaleChanged = false;
        }, 500);
    };

    window.selectRootNote = function (note) {
        rootNote = note;
        window.scaleChanged = true;
        setTimeout(() => {
            window.scaleChanged = false;
        }, 500);
    };

    window.updateFreqTransitionTime = function (sound, value) {
        freqTransitionTimes[sound - 1] = parseFloat(value);
    };

    window.updateReverbSend = updateReverbSend;
    window.updateReverbTime = updateReverbTime;
    window.updateReverbDecay = updateReverbDecay;
    window.selectSound = selectSound;
}

bindScaleAndReverbGlobals();

window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sound-option').forEach((btn) => {
        btn.addEventListener('click', () => {
            const sound = parseInt(btn.dataset.sound, 10);
            selectSound(sound);
        });
    });
});

function toggleLogging() {
    logging = !logging;
    if (debugMode) console.log('Logging:', logging);
}

function saveMovementsToFile() {
    const payload = {
        exportedAt: new Date().toISOString(),
        tracks: soundSlots.map((slot, i) => ({
            sound: i + 1,
            movements: slot.movements
        }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gadam-movements.json';
    a.click();
    URL.revokeObjectURL(a.href);
}
