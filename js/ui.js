function toggleShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

window.toggleShortcutsModal = toggleShortcutsModal;

window.addEventListener('DOMContentLoaded', () => {
    window.selectSound = function(soundId) {
        selectedSound = soundId;
        document.querySelectorAll('.sound-option').forEach((button, index) => {
            if (index + 1 === selectedSound) {
                button.classList.add('flash');
                setTimeout(() => button.classList.remove('flash'), 500);
            } else {
                button.style.backgroundColor = '';
            }
        });
    };
});

function resetAppState() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        const sound = getSound(i);
        if (sound.osc) {
            try {
                sound.osc.stop();
            } catch (error) {
                // Oscillator may already be stopped.
            }
        }
        Object.assign(sound, createSoundState());
    }

    selectedSound = 1;
    recording = false;
    isOverdubbing = false;
    isOverdubMode = false;
    hasOverdubStarted = false;
    overdubStartTime = null;
    overdubStartPosition = null;
    overdubMovements = [];
    overridePositions = { 1: null, 2: null, 3: null, 4: null };
    loopStartTimes = { 1: 0, 2: 0, 3: 0, 4: 0 };
    overdubState = {
        isActive: false,
        startTime: null,
        loopPosition: null,
        buffer: [],
        sound: null
    };

    initAudio();

    document.getElementById('loopIndicator').textContent = 'trzymaj SHIFT by nagrać rutynę';
    document.getElementById('playPauseStatus').textContent = 'Grać';
}

window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
        event.preventDefault();
        resetAppState();
    }
});
