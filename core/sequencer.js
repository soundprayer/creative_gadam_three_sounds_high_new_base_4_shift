const SEQUENCER_HIT_ATTACK = 0.004;
const SEQUENCER_HIT_PEAK = 0.42;
const SEQUENCER_HIT_RELEASE_MS = 70;

function getSequencerStepMs() {
    return 60000 / sequencerBpm / 4;
}

function updateSequencerPlayButton() {
    const btn = document.getElementById('sequencerPlayBtn');
    if (!btn) return;
    if (sequencerRunning) {
        btn.textContent = 'Stop';
        btn.classList.add('step-sequencer__btn--active');
    } else {
        btn.textContent = 'Graj';
        btn.classList.remove('step-sequencer__btn--active');
    }
}

function setSequencerRunning(run) {
    sequencerRunning = !!run;
    if (sequencerRunning) {
        sequencerAccumMs = 0;
        sequencerLastStep = -1;
        sequencerLastMillisForClock = millis();
    } else {
        sequencerLastMillisForClock = 0;
        sequencerHitTimeouts.forEach((t, i) => {
            if (t) {
                clearTimeout(t);
                sequencerHitTimeouts[i] = null;
            }
        });
        document.querySelectorAll('.step-cell--playhead').forEach((el) => {
            el.classList.remove('step-cell--playhead');
        });
    }
    updateSequencerPlayButton();
}

function stopSequencerTransport() {
    setSequencerRunning(false);
}

function syncSequencerGridUi() {
    for (let r = 0; r < NUM_SOUNDS; r++) {
        for (let c = 0; c < SEQUENCER_NUM_STEPS; c++) {
            const btn = document.querySelector(
                `.step-cell[data-sound="${r + 1}"][data-step="${c}"]`
            );
            if (btn) {
                const on = sequencerSteps[r][c];
                btn.classList.toggle('step-cell--on', on);
                btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            }
        }
    }
}

function loadSequencerPreset(rowStrings, bpmOptional) {
    for (let r = 0; r < NUM_SOUNDS; r++) {
        const s = rowStrings[r] || '0'.repeat(SEQUENCER_NUM_STEPS);
        for (let c = 0; c < SEQUENCER_NUM_STEPS; c++) {
            sequencerSteps[r][c] = s.charAt(c) === '1' || s.charAt(c) === 'X';
        }
    }
    if (bpmOptional != null && !Number.isNaN(Number(bpmOptional))) {
        sequencerBpm = Math.min(180, Math.max(60, Number(bpmOptional)));
        const bpmInput = document.querySelector('#stepSequencerMount .step-sequencer__bpm');
        if (bpmInput) bpmInput.value = String(sequencerBpm);
    }
    syncSequencerGridUi();
}

function clearSequencerPattern() {
    for (let r = 0; r < NUM_SOUNDS; r++) {
        for (let c = 0; c < SEQUENCER_NUM_STEPS; c++) {
            sequencerSteps[r][c] = false;
        }
    }
    document.querySelectorAll('.step-cell').forEach((btn) => {
        btn.classList.remove('step-cell--on');
        btn.setAttribute('aria-pressed', 'false');
    });
}

function toggleSequencerStep(soundId, stepIndex) {
    const row = soundId - 1;
    sequencerSteps[row][stepIndex] = !sequencerSteps[row][stepIndex];
    const btn = document.querySelector(
        `.step-cell[data-sound="${soundId}"][data-step="${stepIndex}"]`
    );
    if (btn) {
        btn.classList.toggle('step-cell--on', sequencerSteps[row][stepIndex]);
        btn.setAttribute('aria-pressed', sequencerSteps[row][stepIndex] ? 'true' : 'false');
    }
}

function setPlayheadStep(step) {
    document.querySelectorAll('.step-cell').forEach((btn) => {
        const s = parseInt(btn.dataset.step, 10);
        btn.classList.toggle('step-cell--playhead', s === step);
    });
}

function triggerSequencerHit(soundId) {
    const slot = soundSlot(soundId);
    if (slot.isLoopActive) return;

    const idx = soundId - 1;
    const osc = oscillators[idx];
    if (!osc || !width || !height) return;

    let x = slot.iconX;
    let y = slot.iconY;
    if (x === null || y === null) {
        x = width / 2;
        y = height * 0.72;
    }

    const prevT = sequencerHitTimeouts[idx];
    if (prevT) {
        clearTimeout(prevT);
        sequencerHitTimeouts[idx] = null;
    }

    updateSound(soundId, x, y);
    osc.amp(SEQUENCER_HIT_PEAK, SEQUENCER_HIT_ATTACK);

    sequencerHitTimeouts[idx] = setTimeout(() => {
        osc.amp(0, 0.06);
        sequencerHitTimeouts[idx] = null;
    }, SEQUENCER_HIT_RELEASE_MS);
}

function updateSequencer() {
    if (!sequencerRunning) {
        return;
    }

    const now = millis();
    if (!sequencerLastMillisForClock) {
        sequencerLastMillisForClock = now;
    }
    if (!isPaused) {
        sequencerAccumMs += now - sequencerLastMillisForClock;
    }
    sequencerLastMillisForClock = now;

    const stepMs = getSequencerStepMs();
    const step = Math.floor(sequencerAccumMs / stepMs) % SEQUENCER_NUM_STEPS;

    if (step !== sequencerLastStep) {
        if (!isPaused) {
            for (let s = 1; s <= NUM_SOUNDS; s++) {
                if (sequencerSteps[s - 1][step] && !soundSlot(s).isLoopActive) {
                    triggerSequencerHit(s);
                }
            }
        }
        sequencerLastStep = step;
        setPlayheadStep(step);
    }
}

function initSequencerDom() {
    const mount = document.getElementById('stepSequencerMount');
    if (!mount) return;

    mount.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'step-sequencer__title';
    title.textContent = 'KROK 16 / RYTM (jak w FL — jeden takt, 4 głosy)';
    mount.appendChild(title);

    const toolbar = document.createElement('div');
    toolbar.className = 'step-sequencer__toolbar';

    const bpmLabel = document.createElement('label');
    bpmLabel.innerHTML = 'BPM ';
    const bpmInput = document.createElement('input');
    bpmInput.type = 'number';
    bpmInput.className = 'step-sequencer__bpm';
    bpmInput.min = '60';
    bpmInput.max = '180';
    bpmInput.value = String(sequencerBpm);
    bpmInput.addEventListener('change', () => {
        let v = parseInt(bpmInput.value, 10);
        if (Number.isNaN(v)) v = 120;
        sequencerBpm = Math.min(180, Math.max(60, v));
        bpmInput.value = String(sequencerBpm);
    });
    bpmLabel.appendChild(bpmInput);
    toolbar.appendChild(bpmLabel);

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.id = 'sequencerPlayBtn';
    playBtn.className = 'step-sequencer__btn';
    playBtn.textContent = 'Graj';
    playBtn.addEventListener('click', () => {
        setSequencerRunning(!sequencerRunning);
    });
    toolbar.appendChild(playBtn);

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'step-sequencer__btn';
    clearBtn.textContent = 'Wyczyść siatkę';
    clearBtn.addEventListener('click', () => {
        clearSequencerPattern();
    });
    toolbar.appendChild(clearBtn);

    if (typeof TR808_PRESETS !== 'undefined' && TR808_PRESETS.length) {
        const presetWrap = document.createElement('div');
        presetWrap.className = 'step-sequencer__presets';
        TR808_PRESETS.forEach((preset) => {
            const pb = document.createElement('button');
            pb.type = 'button';
            pb.className = 'step-sequencer__btn step-sequencer__btn--preset';
            pb.textContent = preset.label;
            pb.title = preset.hint || '';
            pb.addEventListener('click', () => {
                loadSequencerPreset(preset.rows, preset.bpm);
            });
            presetWrap.appendChild(pb);
        });
        toolbar.appendChild(presetWrap);
    }

    mount.appendChild(toolbar);

    const header = document.createElement('div');
    header.className = 'step-sequencer__header';
    const spacer = document.createElement('div');
    spacer.className = 'step-sequencer__header-spacer';
    header.appendChild(spacer);
    for (let b = 0; b < 4; b++) {
        const lab = document.createElement('div');
        lab.className = 'step-sequencer__beat-label';
        lab.textContent = String(b + 1);
        header.appendChild(lab);
    }
    mount.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'step-sequencer__grid';

    for (let soundId = 1; soundId <= NUM_SOUNDS; soundId++) {
        const row = document.createElement('div');
        row.className = 'step-sequencer__row';

        const lab = document.createElement('div');
        lab.className = 'step-sequencer__row-label';
        const dot = document.createElement('span');
        dot.className = `step-sequencer__dot step-sequencer__dot--${soundId}`;
        dot.setAttribute('aria-hidden', 'true');
        lab.appendChild(dot);
        row.appendChild(lab);

        for (let step = 0; step < SEQUENCER_NUM_STEPS; step++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'step-cell';
            if (step % 4 === 0) btn.classList.add('step-cell--beat');
            btn.dataset.sound = String(soundId);
            btn.dataset.step = String(step);
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute(
                'aria-label',
                `Głos ${soundId}, krok ${step + 1}`
            );
            btn.addEventListener('click', () => {
                toggleSequencerStep(soundId, step);
            });
            row.appendChild(btn);
        }
        grid.appendChild(row);
    }
    mount.appendChild(grid);

    updateSequencerPlayButton();
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initSequencerDom);
}
