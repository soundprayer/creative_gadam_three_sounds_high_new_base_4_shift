function selectRootNote(value) {
    rootNote = value;
    scaleChangedAt = millis();
    console.log('Selected root note:', rootNote);
}

function selectScale(value) {
    scaleType = value;
    scaleChangedAt = millis();
    console.log('Selected scale:', scaleType);
}

function getNoteNameFromInterval(root, interval, octave) {
    const rootIndex = NOTE_ORDER.indexOf(root);
    const noteIndex = (rootIndex + interval) % 12;
    return NOTE_ORDER[noteIndex] + octave;
}

function getScaleNotes() {
    const rootFreq = BASE_FREQ_MAP[rootNote];
    const pattern = SCALE_PATTERNS[scaleType];
    if (!pattern) return [];

    const notes = [];

    for (let octave = 1; octave <= 6; octave++) {
        const octaveMultiplier = Math.pow(2, octave - 4);

        pattern.forEach(interval => {
            const freq = rootFreq * Math.pow(2, interval / 12) * octaveMultiplier;
            if (freq >= FREQ_MIN && freq <= FREQ_MAX) {
                notes.push({
                    name: getNoteNameFromInterval(rootNote, interval, octave),
                    freq
                });
            }
        });
    }

    return notes;
}

window.selectRootNote = selectRootNote;
window.selectScale = selectScale;
