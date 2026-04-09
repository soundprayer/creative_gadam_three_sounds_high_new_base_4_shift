(function (g) {
    function getNoteNameFromInterval(root, interval, octave) {
        const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootIndex = noteOrder.indexOf(root);
        const noteIndex = (rootIndex + interval) % 12;
        return noteOrder[noteIndex] + octave;
    }

    function getScaleNotesData(rootNote, scaleType) {
        const baseFreqMap = {
            C: 261.63,
            'C#': 277.18,
            D: 293.66,
            'D#': 311.13,
            E: 329.63,
            F: 349.23,
            'F#': 369.99,
            G: 392.0,
            'G#': 415.3,
            A: 440.0,
            'A#': 466.16,
            B: 493.88
        };

        const scalePatterns = {
            pentatonic: [0, 2, 4, 7, 9],
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10],
            harmonic_minor: [0, 2, 3, 5, 7, 8, 11],
            melodic_minor: [0, 2, 3, 5, 7, 9, 11],
            dorian: [0, 2, 3, 5, 7, 9, 10],
            phrygian: [0, 1, 3, 5, 7, 8, 10],
            lydian: [0, 2, 4, 6, 7, 9, 11],
            mixolydian: [0, 2, 4, 5, 7, 9, 10],
            locrian: [0, 1, 3, 5, 6, 8, 10],
            whole_tone: [0, 2, 4, 6, 8, 10],
            diminished: [0, 2, 3, 5, 6, 8, 9, 11],
            arabic: [0, 1, 4, 5, 7, 8, 11],
            japanese: [0, 2, 4, 7, 8],
            gamelan: [0, 1, 3, 7, 8]
        };

        const rootFreq = baseFreqMap[rootNote];
        const pattern = scalePatterns[scaleType];
        const notes = [];

        for (let octave = 1; octave <= 6; octave++) {
            const octaveMultiplier = Math.pow(2, octave - 4);

            pattern.forEach((interval) => {
                const freq = rootFreq * Math.pow(2, interval / 12) * octaveMultiplier;
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

    g.getScaleNotesData = getScaleNotesData;
})(typeof globalThis !== 'undefined' ? globalThis : this);
