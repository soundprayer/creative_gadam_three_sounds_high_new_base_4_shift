// loops.js

function startLoop(movements, sound) {
    // if (!movements || movements.length === 0) {
    //     console.warn(`⚠️ No movements recorded for sound ${sound}. Cannot start loop.`);
    //     return;
    // }

    const loopDuration = movements[movements.length - 1].time;
    loopStartTimes[sound] = millis(); // Set global loop start time

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

    // console.log(`🔁 Loop started for sound ${sound}, duration: ${loopDuration}ms, steps: ${movements.length}`);
}
let loopCycles = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

// loops.js

function updateAllLoops() {
    updateLoop1();
    updateLoop2();
    updateLoop3();
    updateLoop4();
}

function updateLoop1() {
    if (!isLoop1Active || isDragging1) return;
    let elapsedTime = millis() - loop1StartTime;
    while (loop1CurrentIndex < movements1.length && movements1[loop1CurrentIndex].time <= elapsedTime) {
        const movement = movements1[loop1CurrentIndex];
        updateSound(1, movement.x, movement.y);
        loop1CurrentIndex++;
    }
    if (elapsedTime >= loop1Duration) {
        loop1StartTime = millis();
        loop1CurrentIndex = 0;
    }
}

function updateLoop2() {
    if (!isLoop2Active || isDragging2) return;
    let elapsedTime = millis() - loop2StartTime;
    while (loop2CurrentIndex < movements2.length && movements2[loop2CurrentIndex].time <= elapsedTime) {
        const movement = movements2[loop2CurrentIndex];
        updateSound(2, movement.x, movement.y);
        loop2CurrentIndex++;
    }
    if (elapsedTime >= loop2Duration) {
        loop2StartTime = millis();
        loop2CurrentIndex = 0;
    }
}

function updateLoop3() {
    if (!isLoop3Active || isDragging3) return;
    let elapsedTime = millis() - loop3StartTime;
    while (loop3CurrentIndex < movements3.length && movements3[loop3CurrentIndex].time <= elapsedTime) {
        const movement = movements3[loop3CurrentIndex];
        updateSound(3, movement.x, movement.y);
        loop3CurrentIndex++;
    }
    if (elapsedTime >= loop3Duration) {
        loop3StartTime = millis();
        loop3CurrentIndex = 0;
    }
}

function updateLoop4() {
    if (!isLoop4Active || isDragging4) return;
    let elapsedTime = millis() - loop4StartTime;
    while (loop4CurrentIndex < movements4.length && movements4[loop4CurrentIndex].time <= elapsedTime) {
        const movement = movements4[loop4CurrentIndex];
        updateSound(4, movement.x, movement.y);
        loop4CurrentIndex++;
    }
    if (elapsedTime >= loop4Duration) {
        loop4StartTime = millis();
        loop4CurrentIndex = 0;
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
