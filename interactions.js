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
    let position = constrainToBufferZone(mouseX, mouseY);
    if (position.y !== null) {
        updateSound(sound, position.x, position.y);
        if (sound === 1) isDragging1 = true;
        if (sound === 2) isDragging2 = true;
        if (sound === 3) isDragging3 = true;
        if (sound === 4) isDragging4 = true;
    }
}

function handleMouseDrag(sound) {
    handleMousePress(sound);  // Same logic for now
}

function handleMouseRelease(sound) {
    if (sound === 1) isDragging1 = false;
    if (sound === 2) isDragging2 = false;
    if (sound === 3) isDragging3 = false;
    if (sound === 4) isDragging4 = false;
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