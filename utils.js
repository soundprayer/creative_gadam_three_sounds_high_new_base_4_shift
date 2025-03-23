// utils.js

/**
 * Constrain a given (x, y) position to a buffer zone around the canvas.
 * Ensures interactions stay within a defined interaction area.
 *
 * @param {number} x - X-coordinate of the cursor.
 * @param {number} y - Y-coordinate of the cursor.
 * @returns {object} - Constrained position object.
 */
function constrainToBufferZone(x, y) {
    let position = {
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

/**
 * Generate scale notes based on selected root and scale type.
 * Supports multiple musical scales.
 *
 * @returns {Array} Array of note objects with names and frequencies.
 */
function getScaleNotes() {
    const baseFreqMap = {
        'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
        'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
        'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    const scalePatterns = {
        'pentatonic': [0, 2, 4, 7, 9],
        'major': [0, 2, 4, 5, 7, 9, 11],
        'minor': [0, 2, 3, 5, 7, 8, 10],
        'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
        'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
        'dorian': [0, 2, 3, 5, 7, 9, 10],
        'phrygian': [0, 1, 3, 5, 7, 8, 10],
        'lydian': [0, 2, 4, 6, 7, 9, 11],
        'mixolydian': [0, 2, 4, 5, 7, 9, 10],
        'locrian': [0, 1, 3, 5, 6, 8, 10],
        'whole_tone': [0, 2, 4, 6, 8, 10],
        'diminished': [0, 2, 3, 5, 6, 8, 9, 11],
        'arabic': [0, 1, 4, 5, 7, 8, 11],
        'japanese': [0, 2, 4, 7, 8],
        'gamelan': [0, 1, 3, 7, 8]
    };

    let rootFreq = baseFreqMap[rootNote];
    let pattern = scalePatterns[scaleType];
    let notes = [];

    for (let octave = 1; octave <= 6; octave++) {
        let octaveMultiplier = Math.pow(2, octave - 4);

        pattern.forEach(interval => {
            let freq = rootFreq * Math.pow(2, interval / 12) * octaveMultiplier;
            if (freq >= 40 && freq <= 1000) {
                notes.push({
                    name: getNoteNameFromInterval(rootNote, interval, octave),
                    freq: freq
                });
            }
        });
    }

    return notes;
}

/**
 * Compute the note name given root note, interval, and octave.
 *
 * @param {string} root - The root note name.
 * @param {number} interval - Interval from the root note.
 * @param {number} octave - The octave number.
 * @returns {string} - Full note name with octave.
 */
function getNoteNameFromInterval(root, interval, octave) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let rootIndex = noteOrder.indexOf(root);
    let noteIndex = (rootIndex + interval) % 12;
    return noteOrder[noteIndex] + octave;
}

/**
 * Check if an icon for a given sound number already exists.
 *
 * @param {number} sound - Sound number (1-4).
 * @returns {boolean} - True if icon exists, false otherwise.
 */
function iconExists(sound) {
    switch (sound) {
        case 1: return iconX1 !== null;
        case 2: return iconX2 !== null;
        case 3: return iconX3 !== null;
        case 4: return iconX4 !== null;
        default: return false;
    }
}

function getSoundAtPosition(x, y) {
    const threshold = 30;
    const icons = [
        { x: iconX1, y: iconY1, sound: 1 },
        { x: iconX2, y: iconY2, sound: 2 },
        { x: iconX3, y: iconY3, sound: 3 },
        { x: iconX4, y: iconY4, sound: 4 }
    ];

    for (let icon of icons) {
        if (icon.x === null || icon.y === null) continue;
        let d = dist(x, y, icon.x, icon.y);
        if (d < threshold) {
            return icon.sound;
        }
    }
    return null;
}