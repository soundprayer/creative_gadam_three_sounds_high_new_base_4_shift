function getMovementsArray(sound) {
    return getSound(sound).movements;
}

function setMovementsArray(sound, movements) {
    getSound(sound).movements = movements;
}

function getLoopStartTime(sound) {
    return getSound(sound).loopStartTime;
}

function getLoopDuration(sound) {
    return getSound(sound).loopDuration;
}

function setLoopDuration(sound, duration) {
    getSound(sound).loopDuration = duration;
    console.log(`Set loop duration for sound ${sound} to ${duration}`);
}

function getCurrentLoopPosition(sound) {
    return (millis() - loopStartTimes[sound]) % getLoopDuration(sound);
}

function findInsertIndex(movements, time) {
    for (let i = 0; i < movements.length; i++) {
        if (movements[i].time > time) {
            return i;
        }
    }
    return movements.length;
}

function recordMovement(soundId, x, y, time) {
    getMovementsArray(soundId).push({ time, x, y, sound: soundId });
}

function startLoop(movements, soundId) {
    loopStartTimes[soundId] = millis();

    if (movements.length === 0) {
        console.log('No movements recorded, cannot start loop');
        return;
    }

    const loopDuration = movements[movements.length - 1].time;
    console.log('Starting loop with duration:', loopDuration);

    const sound = getSound(soundId);
    sound.loopStartTime = millis();
    sound.loopDuration = loopDuration;
    sound.loopCurrentIndex = 0;
    sound.loopCycleCount = 0;
    sound.loopAnchorX = sound.iconX;
    sound.loopAnchorY = sound.iconY;
    sound.isLoopActive = true;
}

function getRoutinePositionAtLoopTime(sound, loopTime) {
    if (sound.movements.length === 0) return null;

    const movements = sound.movements;
    let nextIndex = 0;

    while (nextIndex < movements.length && movements[nextIndex].time <= loopTime) {
        nextIndex++;
    }

    if (nextIndex > 0) {
        const movement = movements[nextIndex - 1];
        return { x: movement.x, y: movement.y };
    }

    // Before the first keyframe in this cycle.
    if (movements[0].time > loopTime) {
        if (sound.loopCycleCount === 0 &&
            sound.loopAnchorX !== null &&
            sound.loopAnchorY !== null) {
            return { x: sound.loopAnchorX, y: sound.loopAnchorY };
        }

        const tail = movements[movements.length - 1];
        return { x: tail.x, y: tail.y };
    }

    return null;
}

function syncLoopStateToNow(soundId) {
    const sound = getSound(soundId);
    if (!sound.isLoopActive || sound.loopDuration <= 0) return 0;

    let elapsed = millis() - sound.loopStartTime;

    while (elapsed >= sound.loopDuration) {
        sound.loopStartTime += sound.loopDuration;
        elapsed -= sound.loopDuration;
        sound.loopCycleCount++;
    }

    loopStartTimes[soundId] = sound.loopStartTime;

    sound.loopCurrentIndex = 0;
    while (
        sound.loopCurrentIndex < sound.movements.length &&
        sound.movements[sound.loopCurrentIndex].time <= elapsed
    ) {
        sound.loopCurrentIndex++;
    }

    return elapsed;
}

function snapSoundToRoutine(soundId) {
    const sound = getSound(soundId);
    if (!sound.isLoopActive || sound.movements.length === 0) return;

    const loopTime = syncLoopStateToNow(soundId);
    const position = getRoutinePositionAtLoopTime(sound, loopTime);
    if (position) {
        updateSound(soundId, position.x, position.y);
    }
}

function updateLoop(soundId) {
    const sound = getSound(soundId);
    if (!sound.isLoopActive || sound.isDragging) return;

    const elapsedTime = millis() - sound.loopStartTime;

    while (
        sound.loopCurrentIndex < sound.movements.length &&
        sound.movements[sound.loopCurrentIndex].time <= elapsedTime
    ) {
        const movement = sound.movements[sound.loopCurrentIndex];
        updateSound(soundId, movement.x, movement.y);
        sound.loopCurrentIndex++;
    }

    if (elapsedTime >= sound.loopDuration) {
        sound.loopStartTime = millis();
        sound.loopCurrentIndex = 0;
        sound.loopCycleCount++;
        loopStartTimes[soundId] = sound.loopStartTime;
    }
}

function updateAllLoops() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        if (!overridePositions[i]) {
            updateLoop(i);
        }
    }
}

function playMovements(movements, soundId) {
    const part = new p5.Part();

    movements.forEach(movement => {
        part.addCue(movement.time / 1000, () => {
            const sound = getSound(soundId);
            if (!sound.isDragging) {
                updateSound(soundId, movement.x, movement.y);
            }
        });
    });

    part.loop();
    part.start();

    const sound = getSound(soundId);
    if (sound.loopPart) {
        sound.loopPart.stop();
    }
    sound.loopPart = part;
}

function updateLoops() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        updateLoop(i);
    }
    if (recording) {
        console.log('Recording in progress, loops should not be active');
    }
}

function halveLoop(soundId) {
    const loopDuration = getLoopDuration(soundId);
    const halfDuration = loopDuration / 2;
    const currentTime = getCurrentLoopPosition(soundId);
    let movements = getMovementsArray(soundId);

    if (currentTime < halfDuration) {
        movements = movements.filter(mov => mov.time < halfDuration);
    } else {
        movements = movements.filter(mov => mov.time >= halfDuration);
        movements.forEach(mov => {
            mov.time -= halfDuration;
        });
    }

    setLoopDuration(soundId, halfDuration);
    setMovementsArray(soundId, movements);
}

function doubleLoop(soundId) {
    const movements = getMovementsArray(soundId);
    if (movements.length === 0) {
        console.log(`No movements to double for sound ${soundId}`);
        return;
    }

    const originalLength = movements.length;
    const originalDuration = getLoopDuration(soundId);
    const newDuration = originalDuration * 2;

    console.log(
        `Doubling loop for sound ${soundId}. Original length: ${originalLength}, Original duration: ${originalDuration}`
    );

    for (let i = 0; i < originalLength; i++) {
        movements.push({
            ...movements[i],
            time: movements[i].time + originalDuration
        });
    }

    console.log(
        `Loop for sound ${soundId} doubled to ${movements.length} movements with new duration ${newDuration}`
    );
    setLoopDuration(soundId, newDuration);
    startLoop(movements, soundId);
}

function toggleLogging() {
    logging = !logging;
    console.log(logging ? 'Logging enabled' : 'Logging disabled');
}

function saveMovementsToFile() {
    const movements = getMovementsArray(selectedSound);
    const logContent = movements
        .map(m => `time: ${m.time}, x: ${m.x}, y: ${m.y}, sound: ${m.sound}`)
        .join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `movements_log_sound_${selectedSound}_${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function finishShiftRecording() {
    recording = false;
    setLoopIndicatorState('playing');
    console.log('Recording stopped, starting loop');

    const sound = getSound(selectedSound);
    recordMovement(selectedSound, sound.iconX, sound.iconY, millis() - recordStartTime);
    console.log('Final movement recorded at', sound.movements[sound.movements.length - 1]);
    startLoop(sound.movements, selectedSound);

    if (logging) {
        saveMovementsToFile();
    }
}

function startShiftRecording() {
    recording = true;
    recordStartTime = millis();
    console.log('Recording started');

    const sound = getSound(selectedSound);
    sound.movements = [];
    sound.isLoopActive = false;
    console.log(`Loop ${selectedSound} stopped`);

    setLoopIndicatorState('recording');
}
