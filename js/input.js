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

function mousePressed() {
    ensureAudioStarted();

    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }

    const clickedSound = findClickedSound();
    if (clickedSound) {
        selectedSound = clickedSound;
    } else {
        placeSelectedSound();
    }

    if (recording) {
        recordOverdubDuringDrag();
    }

    handleOverdubMousePressed();
}

function mouseDragged() {
    if (overdubState.isActive && mouseIsPressed) {
        recordOverdubPosition();
    }
}

function mouseReleased() {
    getSound(selectedSound).isDragging = false;
}

function keyPressed() {
    if (key === ' ') {
        togglePlay();
    } else if (keyCode === SHIFT) {
        startShiftRecording();
    } else if (key === 'D' || key === 'd') {
        if (mouseIsPressed) {
            overdubStartTime = millis();
            recording = true;
            isOverdubbing = true;
            overdubMovements = [];
            document.getElementById('loopIndicator').textContent = 'Rutyna: POPRAWIANIE';
        }
        beginOverdubEdit();
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
        handleOverdubKeyRelease();
    } else if (key === 'P' || key === 'p') {
        togglePlay();
    }
}
