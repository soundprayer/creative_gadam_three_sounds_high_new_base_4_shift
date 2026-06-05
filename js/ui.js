function setLoopIndicatorState(state) {
    const indicator = document.getElementById('loopIndicator');
    indicator.classList.remove('routine-recording', 'routine-playing', 'routine-correction');

    switch (state) {
        case 'recording':
            indicator.textContent = 'Rutyna: OPRACOWYWANIE';
            indicator.classList.add('routine-recording');
            break;
        case 'playing':
            indicator.textContent = 'Rutyna: ODTWARZA SIĘ';
            indicator.classList.add('routine-playing');
            break;
        case 'correction':
            indicator.textContent = 'Rutyna: POPRAWKI';
            indicator.classList.add('routine-correction');
            break;
        default:
            indicator.textContent = 'trzymaj SHIFT by nagrać rutynę';
    }
}

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
    isCorrectionMode = false;
    correctionGesture.active = false;
    correctionGesture.sound = null;
    correctionGesture.points = [];
    overridePositions = { 1: null, 2: null, 3: null, 4: null };
    loopStartTimes = { 1: 0, 2: 0, 3: 0, 4: 0 };

    initAudio();
    setLoopIndicatorState('idle');
    document.getElementById('playPauseStatus').textContent = 'Grać';
}

window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && (event.key === 'r' || event.key === 'R')) {
        event.preventDefault();
        resetAppState();
    }
});
