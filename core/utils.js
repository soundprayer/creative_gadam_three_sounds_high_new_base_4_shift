// utils.js

function constrainToBufferZone(x, y) {
    const position = {
        x: constrain(x, 0, width),
        y: y,
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

function getScaleNotes() {
    return getScaleNotesData(rootNote, scaleType);
}

function getSoundAtPosition(x, y) {
    const threshold = 25;

    if (debugMode) console.log('Checking click at:', x, y);

    for (let id = 1; id <= NUM_SOUNDS; id++) {
        const slot = soundSlot(id);
        if (slot.iconX !== null && dist(x, y, slot.iconX, slot.iconY) < threshold) {
            return id;
        }
    }

    return null;
}
