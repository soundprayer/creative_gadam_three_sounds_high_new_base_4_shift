function constrainToBufferZone(x, y) {
    const position = {
        x: constrain(x, 0, width),
        y,
        isInBuffer: false,
        edge: null
    };

    if (y < 0 && y > -BUFFER_ZONE) {
        position.y = 0;
        position.isInBuffer = true;
        position.edge = 'top';
    } else if (y > height && y < height + BUFFER_ZONE) {
        position.y = height;
        position.isInBuffer = true;
        position.edge = 'bottom';
    } else if (y >= 0 && y <= height) {
        position.y = constrain(y, 0, height);
    } else {
        position.y = null;
    }

    return position;
}

function drawNoteLines() {
    const notes = getScaleNotes();
    const scaleColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-scale-line')
        .trim();
    const c = color(scaleColor);
    const baseAlpha = 200;
    const isHighlight = scaleChangedAt > 0 && millis() - scaleChangedAt < SCALE_HIGHLIGHT_MS;

    strokeWeight(1);

    notes.forEach(note => {
        const x = freqToX(note.freq);

        if (x >= 0 && x <= width) {
            const lineAlpha = isHighlight
                ? map(sin(frameCount * 0.1), -1, 1, 150, 255)
                : baseAlpha;

            stroke(c.levels[0], c.levels[1], c.levels[2], lineAlpha);
            line(x, 0, x, height);

            noStroke();
            fill(c.levels[0], c.levels[1], c.levels[2], lineAlpha);
            textAlign(CENTER, TOP);
            textSize(12);
            textFont('Press Start 2P');
            text(note.name, constrain(x, 20, width - 20), NOTE_LABEL_Y);
        }
    });
}

function updateSoundSelectorHighlight() {
    document.querySelectorAll('.sound-option').forEach((button, index) => {
        button.style.backgroundColor = index + 1 === selectedSound ? 'white' : '';
    });
}

function drawFrequencyHud() {
    const yOffsets = { 1: -120, 2: -40, 3: 40, 4: 120 };

    noStroke();
    textAlign(CENTER, CENTER);
    textSize(64);
    textFont('Press Start 2P');

    for (let i = 1; i <= SOUND_COUNT; i++) {
        fill(getCssColor(i));
        text(`${Math.round(getSound(i).freq)} Hz`, width / 2, height / 2 + yOffsets[i]);
    }
}

function drawSoundParticles() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        const sound = getSound(i);
        if (!sound.isPlaying || sound.amp <= 0.1) continue;

        const particleSize = map(
            Math.log(sound.freq),
            Math.log(FREQ_MIN),
            Math.log(FREQ_MAX),
            20,
            2
        );
        const cssColor = getCssColor(i);
        const rgb = color(cssColor);

        for (let p = 0; p < 100; p++) {
            const alpha = map(sound.amp, 0.1, 1, 0, 255);
            fill(rgb.levels[0], rgb.levels[1], rgb.levels[2], alpha);
            noStroke();
            rect(random(width), random(height), particleSize, particleSize);
        }
    }
}

function drawSoundIcon(soundId) {
    const sound = getSound(soundId);
    if (sound.iconX === null || sound.iconY === null) return;

    fill(getCssColor(soundId));
    noStroke();

    switch (soundId) {
        case 1:
            ellipse(sound.iconX, sound.iconY, 20, 20);
            break;
        case 2:
            triangle(
                sound.iconX - 10, sound.iconY + 10,
                sound.iconX + 10, sound.iconY + 10,
                sound.iconX, sound.iconY - 10
            );
            break;
        case 3:
            rect(sound.iconX - 10, sound.iconY - 10, 20, 20);
            break;
        case 4:
            ellipse(sound.iconX, sound.iconY, 20, 20);
            break;
    }
}

function drawSelectedIconBorder() {
    const sound = getSound(selectedSound);
    if (sound.iconX === null || sound.iconY === null) return;

    stroke(255);
    strokeWeight(4);
    noFill();

    switch (selectedSound) {
        case 1:
            ellipse(sound.iconX, sound.iconY, 30, 30);
            break;
        case 2:
            triangle(
                sound.iconX - 10, sound.iconY + 10,
                sound.iconX + 10, sound.iconY + 10,
                sound.iconX, sound.iconY - 10
            );
            break;
        case 3:
            rect(sound.iconX - 10, sound.iconY - 10, 20, 20);
            break;
        case 4:
            ellipse(sound.iconX, sound.iconY, 30, 30);
            break;
    }
}

function updatePlayPauseLabel() {
    const playPauseStatus = document.getElementById('playPauseStatus');
    playPauseStatus.textContent = anySoundPlaying() ? 'Odpocząć' : 'Grać';
}

function renderFrame() {
    background(1);
    updateSoundSelectorHighlight();
    drawFrequencyHud();
    drawSoundParticles();

    for (let i = 1; i <= SOUND_COUNT; i++) {
        drawSoundIcon(i);
    }

    drawSelectedIconBorder();
    updatePlayPauseLabel();
    syncAllAudibleStates();
    updateShiftRecordingFromAudible();
    updateCorrectionRecording();

    drawNoteLines();
}
