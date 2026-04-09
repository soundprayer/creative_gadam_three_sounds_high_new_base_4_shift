// interactions.js

function mousePressed() {
    if (selectedSound && mouseY < height - CONTROL_BUFFER) {
        handleMousePress(selectedSound);
    }
}

function mouseDragged() {
    if (selectedSound && mouseY < height - CONTROL_BUFFER) {
        handleMouseDrag(selectedSound);
    }
}

function mouseReleased() {
    if (selectedSound) {
        handleMouseRelease(selectedSound);
    }
}

function keyPressed() {
    const loopIndicator = document.getElementById('loopIndicator');

    if (keyCode === 27) {
        const modal = document.getElementById('shortcutsModal');
        if (modal && modal.style.display === 'block') {
            toggleShortcutsModal();
            return;
        }
    }

    if (!isTypingInFormField() && (key === 'i' || key === 'I')) {
        toggleShortcutsModal();
        return;
    }

    if (key === 'r' || key === 'R') {
        if (keyIsDown(CONTROL)) {
            resetAllLoops();
        }
    }

    if (keyCode === SHIFT) {
        recording = true;
        recordStartTime = millis();
        if (debugMode) console.log('📼 Recording started for sound', selectedSound);

        const movements = getMovementsArray(selectedSound);
        movements.length = 0;
        stopLoop(selectedSound);

        loopIndicator.textContent = 'Rutyna: OPRACOWYWANIE';
        return;
    }

    switch (key.toLowerCase()) {
        case ' ':
            togglePlay();
            break;

        case 'd':
            if (mouseIsPressed) {
                startOverdub();
                loopIndicator.textContent = 'Rutyna: POPRAWIANIE';
            }
            break;

        case 'z':
            halveLoop(selectedSound);
            break;

        case 'x':
            doubleLoop(selectedSound);
            break;

        case 'q':
            toggleSelectedSound();
            break;

        case 'l':
            toggleLogging();
            break;

        case 'p':
            togglePlay();
            break;
    }
}

function keyReleased() {
    const loopIndicator = document.getElementById('loopIndicator');

    if (keyCode === SHIFT) {
        recording = false;
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
        if (debugMode) console.log('📼 Recording stopped for sound', selectedSound);

        const movements = getMovementsArray(selectedSound);
        const slot = soundSlot(selectedSound);

        if (slot.iconX === null || slot.iconY === null) {
            console.warn(`❌ Icon position for sound ${selectedSound} is not set. Cannot start loop.`);
            return;
        }

        movements.push({
            time: millis() - recordStartTime,
            x: slot.iconX,
            y: slot.iconY,
            sound: selectedSound
        });

        startLoop(movements, selectedSound);
        if (debugMode) console.log(`✅ Started loop for sound ${selectedSound} with ${movements.length} movement(s)`);

        if (logging) saveMovementsToFile();
    } else if (key.toLowerCase() === 'd') {
        finalizeOverdub();
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
    }
}

function handleMousePress(sound) {
    const clickedSound = getSoundAtPosition(mouseX, mouseY);

    if (clickedSound) {
        selectedSound = clickedSound;
        soundSlots.forEach((s) => {
            s.isDragging = false;
        });
        soundSlot(clickedSound).isDragging = true;
        if (debugMode) console.log(`✅ Icon clicked on board. SelectedSound is now: ${selectedSound}`);
    } else {
        const pos = constrainToBufferZone(mouseX, mouseY);
        if (pos.y === null) return;

        soundSlot(sound).isDragging = true;
        updateSound(sound, pos.x, pos.y);
        if (debugMode) console.log(`🆕 Placing new icon for sound ${sound} at (${pos.x}, ${pos.y})`);
    }

    redraw();
}

function handleMouseDrag(sound) {
    if (soundSlot(sound).isDragging) {
        const pos = constrainToBufferZone(mouseX, mouseY);
        if (pos.y !== null) {
            updateSound(sound, pos.x, pos.y);
        }
    }
}

function handleMouseRelease(sound) {
    soundSlot(sound).isDragging = false;

    const pos = constrainToBufferZone(mouseX, mouseY);
    if (pos.y === null) return;

    updateSound(sound, pos.x, pos.y);

    const slot = soundSlot(sound);
    const isLoopActive = slot.isLoopActive;

    overridePositions[sound] = isLoopActive ? null : { x: pos.x, y: pos.y };
}

function toggleSelectedSound() {
    selectedSound = (selectedSound % 4) + 1;
    selectSound(selectedSound);
}

function handleMouseInteractions() {
    if (!mouseIsPressed) return;

    if (
        selectedSound &&
        mouseX >= 0 &&
        mouseX <= width &&
        mouseY >= 0 &&
        mouseY <= height
    ) {
        const position = constrainToBufferZone(mouseX, mouseY);
        if (position.y === null) return;

        updateSound(selectedSound, position.x, position.y);

        if (recording) {
            const currentTime = millis() - recordStartTime;
            const movement = {
                time: currentTime,
                x: position.x,
                y: position.y,
                sound: selectedSound
            };

            const movements = getMovementsArray(selectedSound);
            movements.push(movement);
        }

        if (isOverdubbing && selectedSound === overdubSound) {
            overdubMovements.push({
                relMs: millis() - overdubAnchorTime,
                x: position.x,
                y: position.y
            });
        }
    }
}
