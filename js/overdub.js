function canStartOverdub(soundId) {
    const movements = getMovementsArray(soundId);
    return movements && movements.length > 0;
}

function validateOverdubState() {
    if (!canStartOverdub(selectedSound)) {
        isOverdubbing = false;
        return false;
    }
    return true;
}

function mergeOverdubMovements() {
    if (overdubMovements.length === 0) return;

    const originalMovements = getMovementsArray(selectedSound);
    originalMovements.push(...overdubMovements);
    originalMovements.sort((a, b) => a.time - b.time);
    setMovementsArray(selectedSound, originalMovements);
}

function startOverdubRecording() {
    recording = true;
    isOverdubbing = true;
    overdubMovements = [];
    document.getElementById('loopIndicator').textContent = 'Rutyna: POPRAWIANIE';
}

function startOverdub() {
    overdubState.isActive = true;
    overdubState.startTime = millis();
    overdubState.sound = selectedSound;
    overdubState.buffer = [];
    const loopDuration = getLoopDuration(selectedSound);
    overdubState.loopPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
}

function endOverdub() {
    if (!overdubState.isActive) return;

    if (overdubState.buffer.length > 0) {
        const movements = getMovementsArray(overdubState.sound);
        movements.push(...overdubState.buffer);
        movements.sort((a, b) => a.time - b.time);
        setMovementsArray(overdubState.sound, movements);
    }

    overdubState = {
        isActive: false,
        startTime: null,
        loopPosition: null,
        sound: null,
        buffer: []
    };
}

function removeOverdubMovements(currentPosition) {
    if (!overdubState.isActive) return;

    const soundId = overdubState.sound;
    const loopDuration = getLoopDuration(soundId);
    let movements = getMovementsArray(soundId);

    movements = movements.filter(mov => {
        const normalizedTime = mov.time % loopDuration;
        return normalizedTime < overdubState.loopPosition ||
            normalizedTime > currentPosition;
    });

    setMovementsArray(soundId, movements);
}

function recordOverdubPosition() {
    if (!overdubState.isActive) return;

    const soundId = overdubState.sound;
    const loopDuration = getLoopDuration(soundId);
    const currentPosition = (millis() - loopStartTimes[soundId]) % loopDuration;

    removeOverdubMovements(currentPosition);

    overdubState.buffer.push({
        time: currentPosition,
        x: mouseX,
        y: mouseY,
        sound: soundId
    });
}

function recordOverdubMovement() {
    const loopDuration = getLoopDuration(selectedSound);
    const currentLoopPosition = getCurrentLoopPosition(selectedSound);

    overdubMovements.push({
        time: currentLoopPosition,
        x: mouseX,
        y: mouseY,
        sound: selectedSound
    });
}

function recordPosition(x, y) {
    const loopDuration = getLoopDuration(overdubState.sound);
    const position = (millis() - loopStartTimes[overdubState.sound]) % loopDuration;

    overdubState.buffer.push({
        time: position,
        x,
        y,
        sound: overdubState.sound
    });
}

function beginOverdubEdit() {
    isOverdubMode = true;
    hasOverdubStarted = false;
    isOverdubbing = true;
    overdubMovements = [];
    overdubState.buffer = [];
    document.getElementById('loopIndicator').textContent = 'Rutyna: POPRAWIANIE';
    startOverdub();
}

function handleOverdubMousePressed() {
    if (isOverdubMode && !hasOverdubStarted) {
        hasOverdubStarted = true;
        overdubStartTime = millis();
        overdubStartPosition = getCurrentLoopPosition(selectedSound);
    }

    if (isOverdubbing && overdubStartTime === null) {
        overdubStartTime = millis();
        overdubMovements = [];
        overdubMovements.push({
            time: getCurrentLoopPosition(selectedSound),
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        });
    }

    if (isOverdubbing) {
        currentOverdubPosition = getCurrentLoopPosition(selectedSound);
        overdubMovements.push({
            time: currentOverdubPosition,
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        });
    }

    if (isOverdubbing) {
        overdubState.startTime = millis();
        overdubState.loopPosition = getCurrentLoopPosition(selectedSound);

        let movements = getMovementsArray(selectedSound);
        const loopDuration = getLoopDuration(selectedSound);
        movements = movements.filter(mov => {
            const normalizedTime = mov.time % loopDuration;
            return normalizedTime < overdubState.loopPosition;
        });
        setMovementsArray(selectedSound, movements);
        recordPosition(mouseX, mouseY);
    }
}

function handleOverdubMouseRecording() {
    if (!isOverdubbing || !mouseIsPressed) return;

    const loopDuration = getLoopDuration(selectedSound);
    const currentPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;

    overdubMovements.push({
        time: currentPosition,
        x: mouseX,
        y: mouseY,
        sound: selectedSound
    });
}

function handleOverdubKeyRelease() {
    const loopIndicator = document.getElementById('loopIndicator');

    if (overdubMovements.length > 0) {
        let originalMovements = getMovementsArray(selectedSound);
        originalMovements.push(...overdubMovements);
        originalMovements.sort((a, b) => a.time - b.time);
        setMovementsArray(selectedSound, originalMovements);
        overdubMovements = [];
    }
    isOverdubbing = false;
    overdubStartTime = null;

    if (overdubMovements.length > 0) {
        let originalMovements = getMovementsArray(selectedSound);
        const endPosition = getCurrentLoopPosition(selectedSound);

        originalMovements = originalMovements.filter(mov => {
            const pos = mov.time % getLoopDuration(selectedSound);
            return pos < overdubStartPosition || pos > endPosition;
        });

        originalMovements.push(...overdubMovements);
        originalMovements.sort((a, b) => a.time - b.time);
        setMovementsArray(selectedSound, originalMovements);
    }
    isOverdubbing = false;
    overdubStartPosition = null;
    overdubMovements = [];

    if (hasOverdubStarted && overdubMovements.length > 0) {
        mergeOverdubMovements();
    }
    isOverdubMode = false;
    hasOverdubStarted = false;
    overdubStartTime = null;
    overdubMovements = [];

    if (overdubMovements.length > 0) {
        let originalMovements = getMovementsArray(selectedSound);
        originalMovements.push(...overdubMovements);
        originalMovements.sort((a, b) => a.time - b.time);
        setMovementsArray(selectedSound, originalMovements);
    }
    isOverdubbing = false;
    overdubStartTime = null;
    overdubMovements = [];
    loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';

    if (overdubState.buffer.length > 0) {
        let movements = getMovementsArray(overdubState.sound);
        movements.push(...overdubState.buffer);
        movements.sort((a, b) => a.time - b.time);
        setMovementsArray(overdubState.sound, movements);
    }

    isOverdubbing = false;
    overdubState = {
        startTime: null,
        loopPosition: null,
        sound: null,
        buffer: []
    };
    loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';

    endOverdub();
}

function recordOverdubDuringDrag() {
    if (!recording) return;

    const currentTime = millis() - recordStartTime;

    if (isOverdubbing) {
        let movements = getMovementsArray(selectedSound);
        const loopElapsedTime = getCurrentLoopPosition(selectedSound);
        const index = findInsertIndex(movements, loopElapsedTime);
        movements.splice(index, 1, {
            time: loopElapsedTime,
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        });
    } else {
        recordMovement(selectedSound, mouseX, mouseY, currentTime);
    }
}

// Legacy helpers kept for compatibility with experimental overdub paths.
function removeExistingMovements(soundId, startPosition) {
    let movements = getMovementsArray(soundId);
    const loopDuration = getLoopDuration(soundId);

    movements = movements.filter(mov => {
        const normalizedTime = mov.time % loopDuration;
        return normalizedTime < startPosition;
    });

    setMovementsArray(soundId, movements);
}

function finalizeOverdub() {
    if (!overdubState.isActive || overdubState.buffer.length === 0) return;

    const movements = getMovementsArray(overdubState.sound);
    movements.push(...overdubState.buffer);
    movements.sort((a, b) => a.time - b.time);
    setMovementsArray(overdubState.sound, movements);

    overdubState = {
        isActive: false,
        startTime: null,
        loopPosition: null,
        buffer: [],
        sound: null
    };
}

function startOverdubLegacy(soundId, position) {
    removeExistingMovements(soundId, position);
}
