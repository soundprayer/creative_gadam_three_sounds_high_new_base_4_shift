import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('scale', () => {
    let app;

    beforeEach(() => {
        ({ app } = loadApp());
    });

    describe('getNoteNameFromInterval', () => {
        it('returns the root note at interval 0', () => {
            expect(app.getNoteNameFromInterval('C', 0, 4)).toBe('C4');
        });

        it('wraps note names across octaves within the chromatic scale', () => {
            expect(app.getNoteNameFromInterval('A', 3, 4)).toBe('C4');
            expect(app.getNoteNameFromInterval('B', 2, 5)).toBe('C#5');
        });
    });

    describe('getScaleNotes', () => {
        it('returns pentatonic notes within the audible frequency range', () => {
            app.selectRootNote('C');
            app.selectScale('pentatonic');

            const notes = app.getScaleNotes();

            expect(notes.length).toBeGreaterThan(0);
            expect(notes.every((note) => note.freq >= app.FREQ_MIN && note.freq <= app.FREQ_MAX)).toBe(true);
            expect(notes.every((note) => note.name && note.freq > 0)).toBe(true);
        });

        it('includes the root frequency as the first note in octave 4', () => {
            app.selectRootNote('A');
            app.selectScale('major');

            const notes = app.getScaleNotes();
            const rootInOctave4 = notes.find((note) => note.name === 'A4');

            expect(rootInOctave4).toBeDefined();
            expect(rootInOctave4.freq).toBeCloseTo(app.BASE_FREQ_MAP.A * Math.pow(2, 0), 1);
        });

        it('returns an empty list for an unknown scale type', () => {
            app.scaleType = 'nonexistent';

            expect(app.getScaleNotes()).toEqual([]);
        });
    });

    describe('selectRootNote / selectScale', () => {
        it('updates global scale settings', () => {
            app.selectRootNote('G');
            app.selectScale('minor');

            expect(app.rootNote).toBe('G');
            expect(app.scaleType).toBe('minor');
            expect(app.scaleChangedAt).toBe(app.millis());
        });
    });
});
