// loops.js

// Starts looping movements for the specified sound
function startLoop(movements, sound) {
    loopStartTimes[sound] = millis();
    if (!movements.length) {
        console.warn(`No movements recorded for sound ${sound}, cannot start loop.`);
        return;
    }
    const loopDuration = movements[movements.length - 1].time;

    switch(sound) {
        case 1:
            loop1StartTime = millis();
            loop1Duration = loopDuration;
            loop1CurrentIndex = 0;
            isLoop1Active = true;
            break;
        case 2:
            loop2StartTime = millis();
            loop2Duration = loopDuration;
            loop2CurrentIndex = 0;
            isLoop2Active = true;
            break;
        case 3:
            loop3StartTime = millis();
            loop3Duration = loopDuration;
            loop3CurrentIndex = 0;
            isLoop3Active = true;
            break;
        case 4:
            loop4StartTime = millis();
            loop4Duration = loopDuration;
            loop4CurrentIndex = 0;
            isLoop4Active = true;
            break;
    }
}

// Generalized updateLoop function (reusable)
function updateLoop(movements, loopStartTime, loopDuration, loopCurrentIndex, sound, isLoopActive, isDragging) {
    if (!isLoopActive || isDragging) return;

    let elapsedTime = millis() - loopStartTime;

    while (loopCurrentIndex < movements.length && movements[loopCurrentIndex].time <= elapsedTime) {
        let movement = movements[loopCurrentIndex];
        updateSound(sound, movement.x, movement.y);
        loopCurrentIndex++;
    }

    if (elapsedTime >= loopDuration) {
        loopStartTimes[sound] = millis();
        loopCurrentIndex = 0;
    }

    return loopCurrentIndex;
}

// Use the generalized loop updater in draw()
function updateAllLoops() {
    loop1CurrentIndex = updateLoop(movements1, loop1StartTime, loop1Duration, loop1CurrentIndex, 1, isLoop1Active, isDragging1);
    loop2CurrentIndex = updateLoop(movements2, loop2StartTime, loop2Duration, loop2CurrentIndex, 2, isLoop2Active, isDragging2);
    loop3CurrentIndex = updateLoop(movements3, loop3StartTime, loop3Duration, loop3CurrentIndex, 3, isLoop3Active, isDragging3);
    loop4CurrentIndex = updateLoop(movements4, loop4StartTime, loop4Duration, loop4CurrentIndex, 4, isLoop4Active, isDragging4);
}

// Halves the loop duration
function halveLoop(sound) {
    let loopDuration = getLoopDuration(sound);
    let halfDuration = loopDuration / 2;
    let currentTime = (millis() - loopStartTimes[sound]) % loopDuration;

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
    if (movements.length === 0) {
        console.warn(`No movements to double for sound ${sound}`);
        return;
    }

    let originalDuration = getLoopDuration(sound);
    let newDuration = originalDuration * 2;

    let newMovements = movements.map(mov => ({
        ...mov,
        time: mov.time + originalDuration
    }));

    movements.push(...newMovements);
    setLoopDuration(sound, newDuration);
    startLoop(movements, sound);
}

// Helper: get current movements array for sound
function getMovementsArray(sound) {
    switch (sound) {
        case 1: return movements1;
        case 2: return movements2;
        case 3: return movements3;
        case 4: return movements4;
    }
}

// Helper: set movements array
function setMovementsArray(sound, movements) {
    switch (sound) {
        case 1: movements1 = movements; break;
        case 2: movements2 = movements; break;
        case 3: movements3 = movements; break;
        case 4: movements4 = movements; break;
    }
}

// Helper: set loop duration
function setLoopDuration(sound, duration) {
    switch (sound) {
        case 1: loop1Duration = duration; break;
        case 2: loop2Duration = duration; break;
        case 3: loop3Duration = duration; break;
        case 4: loop4Duration = duration; break;
    }
}

// Helper: get loop duration
function getLoopDuration(sound) {
    switch (sound) {
        case 1: return loop1Duration;
        case 2: return loop2Duration;
        case 3: return loop3Duration;
        case 4: return loop4Duration;
    }
}
