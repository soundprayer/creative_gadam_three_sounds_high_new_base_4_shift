function getMouseTargetForSound(soundId) {
    if (!mouseIsPressed || mouseX < 0 || mouseX > width) {
        return null;
    }

    const position = constrainToBufferZone(mouseX, mouseY);
    if (position.y === null || !iconExists(soundId)) {
        return null;
    }

    const sound = getSound(soundId);

    if (ampAdjustGesture.active && ampAdjustGesture.sound === soundId) {
        return null;
    }

    if (correctionGesture.active && correctionGesture.sound === soundId) {
        return { x: position.x, y: position.y };
    }

    if (selectedSound !== soundId) {
        return null;
    }

    if (sound.isLoopActive && !recording) {
        return { x: position.x, y: position.y };
    }

    if (recording && sound.isPlaying) {
        return { x: position.x, y: position.y };
    }

    if (sound.isPlaying && !sound.isLoopActive) {
        return { x: position.x, y: position.y };
    }

    return null;
}

function advanceLoopTimeline(soundId) {
    const sound = getSound(soundId);
    if (!sound.isLoopActive || sound.isDragging || sound.loopDuration <= 0) {
        return null;
    }

    let elapsedTime = millis() - sound.loopStartTime;

    if (elapsedTime >= sound.loopDuration) {
        sound.loopStartTime = millis();
        sound.loopCurrentIndex = 0;
        sound.loopCycleCount++;
        loopStartTimes[soundId] = sound.loopStartTime;
        elapsedTime = millis() - sound.loopStartTime;
    }

    if (appSettings.routineInterpolation) {
        sound.loopCurrentIndex = 0;
        while (
            sound.loopCurrentIndex < sound.movements.length &&
            sound.movements[sound.loopCurrentIndex].time <= elapsedTime
        ) {
            sound.loopCurrentIndex++;
        }
        return elapsedTime;
    }

    while (
        sound.loopCurrentIndex < sound.movements.length &&
        sound.movements[sound.loopCurrentIndex].time <= elapsedTime
    ) {
        sound.loopCurrentIndex++;
    }

    return elapsedTime;
}

function resolveAudibleTarget(soundId, options = {}) {
    const {
        movementsOverride = null,
        loopTimeOverride = null,
        forceRoutine = false
    } = options;
    const sound = getSound(soundId);

    if (!forceRoutine) {
        const mouseTarget = getMouseTargetForSound(soundId);
        if (mouseTarget) {
            return {
                x: mouseTarget.x,
                y: mouseTarget.y,
                loopTime: sound.isLoopActive ? getLoopElapsedTime(soundId) : null,
                source: 'override'
            };
        }
    }

    if (sound.isLoopActive && sound.movements.length > 0 && !sound.isDragging) {
        const loopTime = loopTimeOverride ?? advanceLoopTimeline(soundId);
        if (loopTime === null) {
            return null;
        }

        const position = getRoutinePositionAtLoopTime(sound, loopTime, movementsOverride);
        if (position) {
            return {
                x: position.x,
                y: position.y,
                loopTime,
                source: 'routine'
            };
        }
    }

    if (sound.iconX !== null && sound.iconY !== null) {
        return {
            x: sound.iconX,
            y: sound.iconY,
            loopTime: sound.isLoopActive ? getLoopElapsedTime(soundId) : null,
            source: 'held'
        };
    }

    return null;
}

function applyAudibleTarget(soundId, target) {
    if (!target) {
        return null;
    }

    updateSound(soundId, target.x, target.y);
    return target;
}

function syncAudibleState(soundId, options = {}) {
    return applyAudibleTarget(soundId, resolveAudibleTarget(soundId, options));
}

function syncAllAudibleStates() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        syncAudibleState(i);
    }
}

function getAudibleState(soundId) {
    const sound = getSound(soundId);

    return {
        x: sound.iconX,
        y: sound.iconY,
        freq: sound.freq,
        amp: sound.amp,
        loopTime: sound.isLoopActive ? getLoopElapsedTime(soundId) : null
    };
}

function snapSoundToAudibleRoutine(soundId, loopTimeOverride = null, movementsOverride = null) {
    const sound = getSound(soundId);
    if (!sound.isLoopActive || sound.movements.length === 0) {
        return null;
    }

    if (movementsOverride) {
        syncLoopStateToNow(soundId);
    } else if (loopTimeOverride === null) {
        syncLoopStateToNow(soundId);
    }

    const loopTime = loopTimeOverride ?? getLoopElapsedTime(soundId);
    return syncAudibleState(soundId, {
        forceRoutine: true,
        loopTimeOverride: loopTime,
        movementsOverride
    });
}

function appendAudibleSample(samples, soundId, timeOverride = null) {
    const audible = getAudibleState(soundId);
    if (audible.x === null || audible.y === null) {
        return;
    }

    const sound = getSound(soundId);
    const loopDuration = sound.isLoopActive ? getLoopDuration(soundId) : null;
    const baseTime = timeOverride ?? audible.loopTime ?? 0;
    const last = samples[samples.length - 1];

    if (last && last.x === audible.x && last.y === audible.y) {
        return;
    }

    let time = baseTime;
    if (loopDuration !== null && last && last.time >= baseTime && last.time < baseTime + 1) {
        time = last.time + 0.1;
    }
    if (loopDuration !== null && time >= loopDuration) {
        time = baseTime;
        if (last && last.time === time) {
            last.x = audible.x;
            last.y = audible.y;
            return;
        }
    }

    samples.push({
        time,
        x: audible.x,
        y: audible.y,
        sound: soundId
    });
}

function recordAudibleRoutineSample(soundId, time) {
    const audible = getAudibleState(soundId);
    if (audible.x === null || audible.y === null) {
        return;
    }

    recordMovement(soundId, audible.x, audible.y, time);
}

function updateShiftRecordingFromAudible() {
    if (!recording || !mouseIsPressed) {
        return;
    }

    recordAudibleRoutineSample(selectedSound, millis() - recordStartTime);
}
