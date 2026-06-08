function togglePlay() {
    const playPauseStatus = document.getElementById('playPauseStatus');
    const infoText = document.querySelector('.info');

    if (anySoundPlaying()) {
        stopAllOscillators();
        playPauseStatus.textContent = 'Graj';
        infoText.classList.add('blinking');
    } else {
        startActiveOscillators();
        playPauseStatus.textContent = 'Odpocząć';
        infoText.classList.remove('blinking');
    }
}

function toggleSelectedSound() {
    selectedSound = (selectedSound % SOUND_COUNT) + 1;
}

function findClickedSound() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        const sound = getSound(i);
        if (sound.iconX !== null && dist(mouseX, mouseY, sound.iconX, sound.iconY) < 20) {
            return i;
        }
    }
    return null;
}

function placeSelectedSound() {
    const sound = getSound(selectedSound);
    if (sound.iconX !== null) return;

    startSoundOscillator(selectedSound);
    sound.iconX = mouseX;
    sound.iconY = mouseY;
    updateSound(selectedSound, mouseX, mouseY);
}

function ensureAudioStarted() {
    if (started) return;

    getAudioContext().resume().then(() => {
        started = true;
        document.getElementById('startMessage').style.display = 'none';

        if (!setupComplete) {
            initAudio();
        }
    });
}

function isMouseInSoundboardArea() {
    if (mouseX < 0 || mouseX > width) return false;
    return constrainToBufferZone(mouseX, mouseY).y !== null;
}

function mousePressed() {
    ensureAudioStarted();

    if (!isMouseInSoundboardArea()) {
        return;
    }

    if (tryPrepareAmpAdjustGesture()) {
        return;
    }

    if (isAmpAdjustModifierPressed()) {
        return;
    }

    const clickedSound = findClickedSound();
    if (clickedSound) {
        selectedSound = clickedSound;
    } else if (isCorrectionMode) {
        startCorrectionGesture();
    } else if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        placeSelectedSound();
    }

    if (recording) {
        syncAudibleState(selectedSound);
        recordAudibleRoutineSample(selectedSound, millis() - recordStartTime);
    }
}

function mouseDragged() {
    if (ampAdjustGesture.pending) {
        applyAmpAdjustDrag();
        return;
    }

    recordCorrectionPoint();
}

function mouseReleased() {
    finishAmpAdjustGesture();

    const gestureActive = correctionGesture.active;
    const gestureSound = correctionGesture.sound;
    let snapLoopTime = null;

    if (gestureActive && gestureSound) {
        syncAudibleState(gestureSound);
        recordAudibleCorrectionSample();
        snapLoopTime = getLoopElapsedTime(gestureSound);
    }

    finishCorrectionGesture();

    if (iconExists(selectedSound) && getSound(selectedSound).isLoopActive) {
        const snapTarget = gestureActive && gestureSound ? gestureSound : selectedSound;

        if (gestureActive && snapLoopTime !== null) {
            snapSoundToRoutine(snapTarget, snapLoopTime);
        } else {
            snapSoundToRoutine(selectedSound);
        }
    }

    getSound(selectedSound).isDragging = false;
}

function keyPressed() {
    if (key === ' ') {
        togglePlay();
    } else if (keyCode === SHIFT) {
        startShiftRecording();
    } else if (key === 'D' || key === 'd') {
        enterCorrectionMode();
    } else if (key === 'Z' || key === 'z') {
        halveLoop(selectedSound);
    } else if (key === 'X' || key === 'x') {
        doubleLoop(selectedSound);
    } else if (key === 'Q' || key === 'q') {
        toggleSelectedSound();
    } else if (key === 'L' || key === 'l') {
        toggleLogging();
    } else if (key === 'P' || key === 'p') {
        togglePlay();
    }
}

function keyReleased() {
    if (keyCode === SHIFT) {
        finishShiftRecording();
    } else if (key === 'D' || key === 'd') {
        exitCorrectionMode();
    } else if (key === 'P' || key === 'p') {
        togglePlay();
    }
}
