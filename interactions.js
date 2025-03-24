// interactions.js
console.log(typeof constrainToBufferZone);

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

    if (keyCode === SHIFT) {
        recording = true;
        recordStartTime = millis();
        console.log("📼 Recording started for sound", selectedSound);

        const movements = getMovementsArray(selectedSound);
        movements.length = 0; // Clear previous movements
        stopLoop(selectedSound); // Stop the loop cleanly

        loopIndicator.textContent = 'Rutyna: OPRACOWYWANIE';
        return; // Exit early to avoid falling into switch
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

function stopLoop(sound) {
    if (sound === 1) isLoop1Active = false;
    else if (sound === 2) isLoop2Active = false;
    else if (sound === 3) isLoop3Active = false;
    else if (sound === 4) isLoop4Active = false;
}

function keyReleased() {
    const loopIndicator = document.getElementById('loopIndicator');

    if (keyCode === SHIFT) {
        recording = false;
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
        console.log("📼 Recording stopped for sound", selectedSound);

        const movements = getMovementsArray(selectedSound);

        let iconX, iconY;

        if (selectedSound === 1) { iconX = iconX1; iconY = iconY1; }
        else if (selectedSound === 2) { iconX = iconX2; iconY = iconY2; }
        else if (selectedSound === 3) { iconX = iconX3; iconY = iconY3; }
        else if (selectedSound === 4) { iconX = iconX4; iconY = iconY4; }

        if (iconX === null || iconY === null) {
            console.warn(`❌ Icon position for sound ${selectedSound} is not set. Cannot start loop.`);
            return;
        }

        movements.push({
            time: millis() - recordStartTime,
            x: iconX,
            y: iconY,
            sound: selectedSound
        });

        startLoop(movements, selectedSound);
        console.log(`✅ Started loop for sound ${selectedSound} with ${movements.length} movement(s)`);

        if (logging) saveMovementsToFile();
    }

    else if (key.toLowerCase() === 'd') {
        finalizeOverdub();
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
    }
}


// interactions.js additions:

function handleMousePress(sound) {
    const clickedSound = getSoundAtPosition(mouseX, mouseY);
    console.log("ClickedSound:", clickedSound, "SelectedSound before:", selectedSound);

    if (clickedSound) {
        selectedSound = clickedSound;
        isDragging1 = isDragging2 = isDragging3 = isDragging4 = false;
        window[`isDragging${clickedSound}`] = true;

        console.log(`✅ Icon clicked on board. SelectedSound is now: ${selectedSound}`);
    } else {
        const pos = constrainToBufferZone(mouseX, mouseY);
        if (pos.y === null) return;

        window[`isDragging${sound}`] = true;
        updateSound(sound, pos.x, pos.y);

        console.log(`🆕 Placing new icon for sound ${sound} at (${pos.x}, ${pos.y})`);
    }

    console.log("Dragging flags:", isDragging1, isDragging2, isDragging3, isDragging4);
    redraw(); // Only if you're using noLoop
}
function handleMouseDrag(sound) {
    if (window[`isDragging${sound}`]) {
        const pos = constrainToBufferZone(mouseX, mouseY);
        if (pos.y !== null) {
            updateSound(sound, pos.x, pos.y);
        }
    }
}

function handleMouseRelease(sound) {
    // End dragging
    if (sound === 1) isDragging1 = false;
    if (sound === 2) isDragging2 = false;
    if (sound === 3) isDragging3 = false;
    if (sound === 4) isDragging4 = false;

    // Clamp position within canvas and buffer zone
    const pos = constrainToBufferZone(mouseX, mouseY);
    if (pos.y === null) return;

    // Update oscillator and icon position
    updateSound(sound, pos.x, pos.y);

    // Only persist override if loop isn't active
    const isLoopActive = (
        (sound === 1 && isLoop1Active) ||
        (sound === 2 && isLoop2Active) ||
        (sound === 3 && isLoop3Active) ||
        (sound === 4 && isLoop4Active)
    );

    overridePositions[sound] = isLoopActive ? null : { x: pos.x, y: pos.y };
}


// Add toggleSelectedSound function:
function toggleSelectedSound() {
    selectedSound = selectedSound % 4 + 1;
    window.selectSound(selectedSound);
}

function handleMouseInteractions() {
    if (!mouseIsPressed) return;

    if (
        selectedSound &&
        mouseX >= 0 && mouseX <= width &&
        mouseY >= 0 && mouseY <= height
    ) {
        const position = constrainToBufferZone(mouseX, mouseY);
        if (position.y === null) return;

        // Always update sound position
        updateSound(selectedSound, position.x, position.y);

        // ✅ Record movements only while SHIFT is held
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
    }
}

function handleOverdub() {
    // Add logic here if needed
    // For now, a placeholder will prevent the error
}