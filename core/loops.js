function stopLoop(sound) {
    soundSlot(sound).isLoopActive = false;
}

function getLoopElapsedMs(sound) {
    return millis() - soundSlot(sound).loopStartTime;
}

function updateAllLoops() {
    for (let soundId = 1; soundId <= NUM_SOUNDS; soundId++) {
        updateLoop(soundId);
    }
}

function updateLoop(soundId) {
    const slot = soundSlot(soundId);

    if (!slot.isLoopActive || slot.isDragging || isPaused) return;

    let elapsedTime = millis() - slot.loopStartTime;

    while (
        slot.loopCurrentIndex < slot.movements.length &&
        slot.movements[slot.loopCurrentIndex].time <= elapsedTime
    ) {
        const movement = slot.movements[slot.loopCurrentIndex];
        updateSound(soundId, movement.x, movement.y);
        slot.loopCurrentIndex++;
    }

    if (elapsedTime >= slot.loopDuration) {
        slot.loopStartTime = millis();
        slot.loopCurrentIndex = 0;
    }
}

function startLoop(movements, sound) {
    if (!movements.length) {
        console.warn(`No movements recorded for sound ${sound}, cannot start loop.`);
        return;
    }
    const loopDuration = movements[movements.length - 1].time;
    const slot = soundSlot(sound);
    const osc = oscillators[sound - 1];

    if (!slot.isPlaying) {
        osc.start();
        slot.isPlaying = true;
    }
    slot.loopStartTime = millis();
    slot.loopDuration = loopDuration;
    slot.loopCurrentIndex = 0;
    slot.isLoopActive = true;
    console.log(`✅ Started loop for sound ${sound} with ${movements.length} movement(s)`);
}

function halveLoop(sound) {
    const slot = soundSlot(sound);
    const loopDuration = slot.loopDuration;
    const halfDuration = loopDuration / 2;
    const currentTime = getLoopElapsedMs(sound) % loopDuration;

    let movements = slot.movements.slice();
    if (currentTime < halfDuration) {
        movements = movements.filter((mov) => mov.time < halfDuration);
    } else {
        movements = movements.filter((mov) => mov.time >= halfDuration);
        movements.forEach((mov) => {
            mov.time -= halfDuration;
        });
    }

    slot.loopDuration = halfDuration;
    slot.movements = movements;
}

function doubleLoop(sound) {
    const slot = soundSlot(sound);
    let movements = slot.movements.slice();
    const originalDuration = slot.loopDuration;
    const newDuration = originalDuration * 2;

    const newMovements = movements.map((mov) => ({
        ...mov,
        time: mov.time + originalDuration
    }));

    movements.push(...newMovements);
    slot.loopDuration = newDuration;
    slot.movements = movements;
    startLoop(movements, sound);
}

function resetAllLoops() {
    soundSlots.forEach((slot, index) => {
        const osc = oscillators[index];
        if (slot.isPlaying && osc) {
            osc.stop();
        }
        slot.isPlaying = false;
        slot.movements = [];
        slot.isLoopActive = false;
        slot.loopCurrentIndex = 0;
        slot.iconX = null;
        slot.iconY = null;
    });

    overridePositions = { 1: null, 2: null, 3: null, 4: null };

    recording = false;
    isPaused = false;
    isOverdubbing = false;
    overdubMovements = [];

    const loopIndicator = document.getElementById('loopIndicator');
    if (loopIndicator) loopIndicator.textContent = 'Rutyna: BRAK';

    stopSequencerTransport();

    console.log('♻️ Reset – wszystkie loopy, dźwięki i pozycje zostały wyczyszczone');
}

function getMovementsArray(sound) {
    return soundSlot(sound).movements;
}

function getLoopDuration(sound) {
    return soundSlot(sound).loopDuration;
}
