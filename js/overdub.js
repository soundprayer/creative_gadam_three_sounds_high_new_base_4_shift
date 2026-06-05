let isCorrectionMode = false;

let correctionGesture = {
    active: false,
    sound: null,
    points: []
};

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

    const soundId = correctionGesture.sound;
    const sound = getSound(soundId);
    if (sound.iconX === null || sound.iconY === null) return;

    const baseTime = getCurrentLoopPosition(soundId);
    const loopDuration = getLoopDuration(soundId);
    const points = correctionGesture.points;
    const last = points[points.length - 1];
    const x = sound.iconX;
    const y = sound.iconY;

    if (last && last.x === x && last.y === y) return;

    let time = baseTime;
    if (last && last.time >= baseTime && last.time < baseTime + 1) {
        time = last.time + 0.1;
    }
    if (time >= loopDuration) {
        time = baseTime;
        if (last && last.time === time) {
            last.x = x;
            last.y = y;
            return;
        }
    }

    points.push({
        time,
        x,
        y,
        sound: soundId
    });
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
