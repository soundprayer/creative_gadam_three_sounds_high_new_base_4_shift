// interactions.js
console.log(typeof constrainToBufferZone);

function mousePressed() {
    if (selectedSound && mouseY < height - CONTROL_BUFFER) {
        handleMousePress(selectedSound);
    }
}
function handleMousePress(sound) {
    const pos = constrainToBufferZone(mouseX, mouseY);
    if (pos.y === null) return;

    const clickedSound = getSoundAtPosition(mouseX, mouseY);

    if (clickedSound) {
        // Clicked on existing icon — switch to that sound
        selectedSound = clickedSound;

        // Reset dragging flags
        isDragging1 = isDragging2 = isDragging3 = isDragging4 = false;
        window[`isDragging${clickedSound}`] = true;
    } else {
        // Clicked empty space — drag current sound
        window[`isDragging${sound}`] = true;

        // Set icon to current position if not yet placed
        updateSound(sound, pos.x, pos.y);
    }

    console.log("Mouse press:", { selectedSound, isDragging1, isDragging2, isDragging3, isDragging4 });

    redraw(); // Only if you're using noLoop()
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

    switch (key.toLowerCase()) {
        case ' ':
            togglePlay();
            break;

        case 'shift':
            recording = true;
            recordStartTime = millis();
            console.log("Recording started");

            if (selectedSound === 1) {
                movements1 = [];
                isLoop1Active = false;
            } else if (selectedSound === 2) {
                movements2 = [];
                isLoop2Active = false;
            } else if (selectedSound === 3) {
                movements3 = [];
                isLoop3Active = false;
            } else if (selectedSound === 4) {
                movements4 = [];
                isLoop4Active = false;
            }
            loopIndicator.textContent = 'Rutyna: OPRACOWYWANIE';
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
        console.log("Recording stopped, starting loop");

        const movements = getMovementsArray(selectedSound);
        let iconX, iconY;

        if (selectedSound === 1) { iconX = iconX1; iconY = iconY1; }
        else if (selectedSound === 2) { iconX = iconX2; iconY = iconY2; }
        else if (selectedSound === 3) { iconX = iconX3; iconY = iconY3; }
        else if (selectedSound === 4) { iconX = iconX4; iconY = iconY4; }

        movements.push({ time: millis() - recordStartTime, x: iconX, y: iconY, sound: selectedSound });
        startLoop(movements, selectedSound);

        if (logging) saveMovementsToFile();
    }

    else if (key.toLowerCase() === 'd') {
        finalizeOverdub();
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
    }
}

// interactions.js additions:

function handleMousePress(sound) {
    const pos = constrainToBufferZone(mouseX, mouseY);
    if (pos.y === null) return;

    const clickedSound = getSoundAtPosition(mouseX, mouseY);

    if (clickedSound) {
        // Set selected sound to the one clicked
        selectedSound = clickedSound;

        // Reset all dragging flags
        isDragging1 = isDragging2 = isDragging3 = isDragging4 = false;
        window[`isDragging${clickedSound}`] = true;
    } else {
        // If nothing was clicked, just start dragging selectedSound
        window[`isDragging${sound}`] = true;
    }

    redraw(); // only if using noLoop
}




function handleMouseDrag(sound) {
    handleMousePress(sound);  // Same logic for now
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
    if (mouseIsPressed) {
        if (selectedSound && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            let position = constrainToBufferZone(mouseX, mouseY);
            if (position.y !== null) {
                updateSound(selectedSound, position.x, position.y);
            }
        }
    }
}

function handleOverdub() {
    // Add logic here if needed
    // For now, a placeholder will prevent the error
}