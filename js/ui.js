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
    if (!modal) return;

    const shouldOpen = modal.style.display !== 'block' && modal.style.display !== 'flex';
    modal.style.display = shouldOpen ? 'block' : 'none';
    if (shouldOpen) {
        modal.classList.add('modal-open');
    } else {
        modal.classList.remove('modal-open');
    }
}

window.toggleShortcutsModal = toggleShortcutsModal;

function syncTrailSettingsToDom() {
    const settings = getTrailSettings();
    const setChecked = (id, value) => {
        const input = document.getElementById(id);
        if (input) input.checked = value;
    };
    const setRange = (id, value, valueId) => {
        const input = document.getElementById(id);
        const label = document.getElementById(valueId);
        if (input) input.value = String(value);
        if (label) label.textContent = String(value);
    };

    setChecked('trailBehindEnabled', settings.behindEnabled);
    setChecked('trailAheadEnabled', settings.aheadEnabled);
    setChecked('trailKeyframeOnly', settings.keyframeOnly);
    setRange('trailMaxAgeMs', settings.maxAgeMs, 'trailMaxAgeMsValue');
    setRange('trailAheadHorizonMs', settings.aheadHorizonMs, 'trailAheadHorizonMsValue');
    setRange('trailSampleStepMs', settings.sampleStepMs, 'trailSampleStepMsValue');
    setRange('trailAlphaMax', settings.alphaMax, 'trailAlphaMaxValue');
    setRange('trailGhostSize', settings.ghostSize, 'trailGhostSizeValue');
}

function syncTrailSettingsFromDom() {
    const settings = getTrailSettings();
    const behind = document.getElementById('trailBehindEnabled');
    const ahead = document.getElementById('trailAheadEnabled');
    const keyframeOnly = document.getElementById('trailKeyframeOnly');
    const maxAge = document.getElementById('trailMaxAgeMs');
    const aheadHorizon = document.getElementById('trailAheadHorizonMs');
    const sampleStep = document.getElementById('trailSampleStepMs');
    const alphaMax = document.getElementById('trailAlphaMax');
    const ghostSize = document.getElementById('trailGhostSize');

    if (behind) settings.behindEnabled = behind.checked;
    if (ahead) settings.aheadEnabled = ahead.checked;
    if (keyframeOnly) settings.keyframeOnly = keyframeOnly.checked;
    if (maxAge) settings.maxAgeMs = Number(maxAge.value);
    if (aheadHorizon) settings.aheadHorizonMs = Number(aheadHorizon.value);
    if (sampleStep) settings.sampleStepMs = Number(sampleStep.value);
    if (alphaMax) settings.alphaMax = Number(alphaMax.value);
    if (ghostSize) settings.ghostSize = Number(ghostSize.value);

    syncTrailSettingsToDom();
}

function toggleTrailSettingsMenu() {
    const menu = document.getElementById('trailSettingsMenu');
    const toggle = document.getElementById('trailSettingsToggle');
    if (!menu || !toggle) return;

    const open = menu.hidden;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function initTrailSettingsPanel() {
    syncTrailSettingsToDom();

    const toggle = document.getElementById('trailSettingsToggle');
    if (toggle) {
        toggle.addEventListener('click', toggleTrailSettingsMenu);
    }

    [
        'trailBehindEnabled',
        'trailAheadEnabled',
        'trailKeyframeOnly',
        'trailMaxAgeMs',
        'trailAheadHorizonMs',
        'trailSampleStepMs',
        'trailAlphaMax',
        'trailGhostSize'
    ].forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', syncTrailSettingsFromDom);
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initTrailSettingsPanel();

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
    loopStartTimes = { 1: 0, 2: 0, 3: 0, 4: 0 };
    aspectTrails[1] = [];
    aspectTrails[2] = [];
    aspectTrails[3] = [];
    aspectTrails[4] = [];

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
