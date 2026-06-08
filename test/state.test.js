import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('state', () => {
    let app;

    beforeEach(() => {
        ({ app } = loadApp({ width: 800, height: 400 }));
    });

    describe('createSoundState', () => {
        it('returns a fresh sound object with default loop and icon fields', () => {
            const sound = app.createSoundState();

            expect(sound).toMatchObject({
                osc: null,
                isPlaying: false,
                iconX: null,
                iconY: null,
                movements: [],
                isLoopActive: false,
                loopDuration: 0,
                loopCycleCount: 0,
                loopAnchorX: null,
                loopAnchorY: null,
                isDragging: false
            });
        });
    });

    describe('getTrailSettings', () => {
        it('returns default trail configuration from TRAIL_DEFAULTS', () => {
            expect(app.getTrailSettings()).toMatchObject({
                behindEnabled: true,
                aheadEnabled: true,
                maxAgeMs: 1300,
                aheadHorizonMs: 1400,
                sampleStepMs: 240,
                alphaMax: 54,
                ghostSize: 17,
                keyframeOnly: false,
                minDistance: 3,
                maxSamples: 90
            });
        });
    });

    describe('aspectTrails', () => {
        it('starts with empty trails for each aspect', () => {
            for (let i = 1; i <= app.SOUND_COUNT; i++) {
                expect(app.aspectTrails[i]).toEqual([]);
            }
        });
    });

    describe('anySoundPlaying', () => {
        it('returns false when no oscillators are active', () => {
            expect(app.anySoundPlaying()).toBe(false);
        });

        it('returns true when at least one sound is playing', () => {
            app.getSound(2).isPlaying = true;

            expect(app.anySoundPlaying()).toBe(true);
        });
    });

    describe('iconExists', () => {
        it('reflects whether a sound icon has been placed', () => {
            expect(app.iconExists(1)).toBe(false);

            app.getSound(1).iconX = 100;

            expect(app.iconExists(1)).toBe(true);
        });
    });

    describe('frequency ↔ canvas mapping', () => {
        it('maps minimum and maximum frequencies to canvas edges', () => {
            expect(app.freqToX(app.FREQ_MIN)).toBeCloseTo(0, 5);
            expect(app.freqToX(app.FREQ_MAX)).toBeCloseTo(app.width, 5);
        });

        it('round-trips frequency through x coordinates', () => {
            const original = 220;

            expect(app.xToFreq(app.freqToX(original))).toBeCloseTo(original, 5);
        });

        it('maps x position back to exponential frequency', () => {
            expect(app.xToFreq(0)).toBeCloseTo(app.FREQ_MIN, 5);
            expect(app.xToFreq(app.width / 2)).toBeCloseTo(Math.sqrt(app.FREQ_MIN * app.FREQ_MAX), 2);
            expect(app.xToFreq(app.width)).toBeCloseTo(app.FREQ_MAX, 2);
        });
    });

    describe('getCssColor', () => {
        it('reads sound colors from CSS custom properties', () => {
            expect(app.getCssColor(1)).toBe('rgb(123, 0, 255)');
            expect(app.getCssColor(4)).toBe('rgb(255, 234, 0)');
        });
    });
});
