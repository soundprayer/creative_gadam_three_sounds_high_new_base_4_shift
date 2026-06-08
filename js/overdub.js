let isCorrectionMode = false;

let correctionGesture = {
    active: false,
    sound: null,
    points: []
};

let ampAdjustGesture = {
    pending: false,
    active: false,
    sound: null,
    startMouseY: 0,
    baseMovementYs: [],
    baseLoopAnchorY: null
};

function resetAmpAdjustGesture() {
    ampAdjustGesture.pending = false;
    ampAdjustGesture.active = false;
    ampAdjustGesture.sound = null;
    ampAdjustGesture.startMouseY = 0;
    ampAdjustGesture.baseMovementYs = [];
    ampAdjustGesture.baseLoopAnchorY = null;
}

function canAdjustRoutineAmp() {
    if (recording) return false;

    const sound = getSound(selectedSound);
    return iconExists(selectedSound) && sound.movements.length > 0;
}

function isAmpAdjustModifierPressed() {
    return keyIsDown(CONTROL);
}

function tryPrepareAmpAdjustGesture() {
    if (!isAmpAdjustModifierPressed() || !canAdjustRoutineAmp()) {
        return false;
    }

    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return false;
    }

    const sound = getSound(selectedSound);
    ampAdjustGesture.pending = true;
    ampAdjustGesture.active = false;
    ampAdjustGesture.sound = selectedSound;
    ampAdjustGesture.startMouseY = mouseY;
    ampAdjustGesture.baseMovementYs = sound.movements.map((movement) => movement.y);
    ampAdjustGesture.baseLoopAnchorY = sound.loopAnchorY;
    return true;
}

function applyAmpAdjustDrag() {
    if (!ampAdjustGesture.pending || !isAmpAdjustModifierPressed()) {
        return;
    }

    if (!ampAdjustGesture.active && mouseY !== ampAdjustGesture.startMouseY) {
        ampAdjustGesture.active = true;
    }

    if (!ampAdjustGesture.active) {
        return;
    }

    const soundId = ampAdjustGesture.sound;
    const sound = getSound(soundId);
    const deltaY = mouseY - ampAdjustGesture.startMouseY;

    sound.movements.forEach((movement, index) => {
        movement.y = constrain(ampAdjustGesture.baseMovementYs[index] + deltaY, 0, height);
    });

    if (ampAdjustGesture.baseLoopAnchorY !== null) {
        sound.loopAnchorY = constrain(ampAdjustGesture.baseLoopAnchorY + deltaY, 0, height);
    }

    syncAudibleState(soundId, { forceRoutine: true });
}

function finishAmpAdjustGesture() {
    if (ampAdjustGesture.active && ampAdjustGesture.sound) {
        establishRoutineBaseline(ampAdjustGesture.sound);
    }

    resetAmpAdjustGesture();
}

function canCorrectSelectedSound() {
    const sound = getSound(selectedSound);
    return sound.isLoopActive && sound.movements.length > 0 && iconExists(selectedSound);
}

function isInLoopTimeRange(time, rangeStart, rangeEnd, loopDuration) {
    const t = time % loopDuration;
    const start = rangeStart % loopDuration;
    const end = rangeEnd % loopDuration;

    if (start <= end) {
        return t >= start && t <= end;
    }

    return t >= start || t <= end;
}

function enterCorrectionMode() {
    if (!canCorrectSelectedSound()) {
        console.log('POPRAWKI: brak aktywnej rutyny na wybranym aspekcie');
        return;
    }

    isCorrectionMode = true;
    setLoopIndicatorState('correction');
}

function exitCorrectionMode() {
    isCorrectionMode = false;
    correctionGesture.active = false;
    correctionGesture.sound = null;
    correctionGesture.points = [];

    if (getSound(selectedSound).isLoopActive) {
        setLoopIndicatorState('playing');
    } else {
        setLoopIndicatorState('idle');
    }
}

function startCorrectionGesture() {
    if (!isCorrectionMode || !canCorrectSelectedSound()) return;

    const position = constrainToBufferZone(mouseX, mouseY);
    if (position.y === null) return;

    correctionGesture.active = true;
    correctionGesture.sound = selectedSound;
    correctionGesture.points = [];
}

function recordAudibleCorrectionSample() {
    if (!correctionGesture.active) return;
    appendAudibleSample(correctionGesture.points, correctionGesture.sound);
}

function recordCorrectionPoint() {
    if (!correctionGesture.active || !mouseIsPressed) return;
    recordAudibleCorrectionSample();
}

function finishCorrectionGesture() {
    if (!correctionGesture.active) return;

    const soundId = correctionGesture.sound;
    const points = correctionGesture.points.slice();

    correctionGesture.active = false;
    correctionGesture.points = [];

    if (points.length === 0) return;

    const loopDuration = getLoopDuration(soundId);
    const rangeStart = points[0].time;
    const rangeEnd = points[points.length - 1].time;

    let movements = getMovementsArray(soundId).filter((mov) => {
        return !isInLoopTimeRange(mov.time, rangeStart, rangeEnd, loopDuration);
    });

    movements.push(...points);
    movements.sort((a, b) => a.time - b.time);
    setMovementsArray(soundId, movements);

    syncLoopStateToNow(soundId);
}

function updateCorrectionRecording() {
    if (correctionGesture.active && mouseIsPressed) {
        recordAudibleCorrectionSample();
    }
}
