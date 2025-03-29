function updateAllLoops() {
    updateLoop(1);
    updateLoop(2);
    updateLoop(3);
    updateLoop(4);
}

function updateLoop(soundId) {
    const isLoopActive = {
        1: isLoop1Active,
        2: isLoop2Active,
        3: isLoop3Active,
        4: isLoop4Active
    };

    const isDragging = {
        1: isDragging1,
        2: isDragging2,
        3: isDragging3,
        4: isDragging4
    };

    const loopStartTimeMap = {
        1: loop1StartTime,
        2: loop2StartTime,
        3: loop3StartTime,
        4: loop4StartTime
    };

    const loopCurrentIndexMap = {
        1: loop1CurrentIndex,
        2: loop2CurrentIndex,
        3: loop3CurrentIndex,
        4: loop4CurrentIndex
    };

    const loopDurationMap = {
        1: loop1Duration,
        2: loop2Duration,
        3: loop3Duration,
        4: loop4Duration
    };

    const movementsMap = {
        1: movements1,
        2: movements2,
        3: movements3,
        4: movements4
    };

    if (!isLoopActive[soundId] || isDragging[soundId] || isPaused) return;

    let elapsedTime = millis() - loopStartTimeMap[soundId];

    while (
        loopCurrentIndexMap[soundId] < movementsMap[soundId].length &&
        movementsMap[soundId][loopCurrentIndexMap[soundId]].time <= elapsedTime
        ) {
        const movement = movementsMap[soundId][loopCurrentIndexMap[soundId]];
        updateSound(soundId, movement.x, movement.y);
        loopCurrentIndexMap[soundId]++;
    }

    if (elapsedTime >= loopDurationMap[soundId]) {
        switch (soundId) {
            case 1:
                loop1StartTime = millis();
                loop1CurrentIndex = 0;
                break;
            case 2:
                loop2StartTime = millis();
                loop2CurrentIndex = 0;
                break;
            case 3:
                loop3StartTime = millis();
                loop3CurrentIndex = 0;
                break;
            case 4:
                loop4StartTime = millis();
                loop4CurrentIndex = 0;
                break;
        }
    }
}


function startLoop(movements, sound) {
    if (!movements.length) {
        console.warn(`No movements recorded for sound ${sound}, cannot start loop.`);
        return;
    }
    const loopDuration = movements[movements.length - 1].time;
    loopStartTimes[sound] = millis();

    switch (sound) {
        case 1:
            if (!isPlaying1) { osc1.start(); isPlaying1 = true; }
            loop1StartTime = millis();
            loop1Duration = loopDuration;
            loop1CurrentIndex = 0;
            isLoop1Active = true;
            break;
        case 2:
            if (!isPlaying2) { osc2.start(); isPlaying2 = true; }
            loop2StartTime = millis();
            loop2Duration = loopDuration;
            loop2CurrentIndex = 0;
            isLoop2Active = true;
            break;
        case 3:
            if (!isPlaying3) { osc3.start(); isPlaying3 = true; }
            loop3StartTime = millis();
            loop3Duration = loopDuration;
            loop3CurrentIndex = 0;
            isLoop3Active = true;
            break;
        case 4:
            if (!isPlaying4) { osc4.start(); isPlaying4 = true; }
            loop4StartTime = millis();
            loop4Duration = loopDuration;
            loop4CurrentIndex = 0;
            isLoop4Active = true;
            break;
    }
    console.log(`✅ Started loop for sound ${sound} with ${movements.length} movement(s)`);
}

// Halves the loop duration
function halveLoop(sound) {
    const loopDuration = getLoopDuration(sound);
    const halfDuration = loopDuration / 2;
    const currentTime = (millis() - loopStartTimes[sound]) % loopDuration;

    let movements = getMovementsArray(sound);
    if (currentTime < halfDuration) {
        movements = movements.filter(mov => mov.time < halfDuration);
    } else {
        movements = movements.filter(mov => mov.time >= halfDuration);
        movements.forEach(mov => mov.time -= halfDuration);
    }

    setLoopDuration(sound, halfDuration);
    setMovementsArray(sound, movements);
}

// Doubles the loop duration
function doubleLoop(sound) {
    let movements = getMovementsArray(sound);

    const originalDuration = getLoopDuration(sound);
    const newDuration = originalDuration * 2;

    const newMovements = movements.map(mov => ({
        ...mov,
        time: mov.time + originalDuration
    }));

    movements.push(...newMovements);
    setLoopDuration(sound, newDuration);
    setMovementsArray(sound, movements);
    startLoop(movements, sound);
}

function resetAllLoops() {
    // Stop oscillators
    if (isPlaying1) { osc1.stop(); isPlaying1 = false; }
    if (isPlaying2) { osc2.stop(); isPlaying2 = false; }
    if (isPlaying3) { osc3.stop(); isPlaying3 = false; }
    if (isPlaying4) { osc4.stop(); isPlaying4 = false; }

    // Reset loop state
    movements1 = [];
    movements2 = [];
    movements3 = [];
    movements4 = [];

    isLoop1Active = false;
    isLoop2Active = false;
    isLoop3Active = false;
    isLoop4Active = false;

    loop1CurrentIndex = 0;
    loop2CurrentIndex = 0;
    loop3CurrentIndex = 0;
    loop4CurrentIndex = 0;

    // Reset icon positions
    iconX1 = null; iconY1 = null;
    iconX2 = null; iconY2 = null;
    iconX3 = null; iconY3 = null;
    iconX4 = null; iconY4 = null;

    overridePositions = { 1: null, 2: null, 3: null, 4: null };

    // Reset flags
    recording = false;
    isPaused = false;

    // Optional UI feedback
    const loopIndicator = document.getElementById('loopIndicator');
    loopIndicator.textContent = 'Rutyna: BRAK';

    console.log("♻️ Reset – wszystkie loopy, dźwięki i pozycje zostały wyczyszczone");
}

// Helpers
function getMovementsArray(sound) {
    switch (sound) {
        case 1: return movements1;
        case 2: return movements2;
        case 3: return movements3;
        case 4: return movements4;
    }
}

function setMovementsArray(sound, movements) {
    switch (sound) {
        case 1: movements1 = movements; break;
        case 2: movements2 = movements; break;
        case 3: movements3 = movements; break;
        case 4: movements4 = movements; break;
    }
}

function setLoopDuration(sound, duration) {
    switch (sound) {
        case 1: loop1Duration = duration; break;
        case 2: loop2Duration = duration; break;
        case 3: loop3Duration = duration; break;
        case 4: loop4Duration = duration; break;
    }
}

function getLoopDuration(sound) {
    switch (sound) {
        case 1: return loop1Duration;
        case 2: return loop2Duration;
        case 3: return loop3Duration;
        case 4: return loop4Duration;
    }
}
