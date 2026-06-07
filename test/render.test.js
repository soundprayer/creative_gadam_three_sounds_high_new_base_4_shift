import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('render helpers', () => {
    let app;
    const CANVAS_HEIGHT = 400;
    const BUFFER_ZONE = 44;

    beforeEach(() => {
        ({ app } = loadApp({ width: 800, height: CANVAS_HEIGHT }));
    });

    describe('constrainToBufferZone', () => {
        it('keeps valid canvas coordinates unchanged', () => {
            const position = app.constrainToBufferZone(400, 200);

            expect(position).toEqual({
                x: 400,
                y: 200,
                isInBuffer: false,
                edge: null
            });
        });

        it('snaps the top buffer zone to y = 0', () => {
            const position = app.constrainToBufferZone(100, -20);

            expect(position.y).toBe(0);
            expect(position.isInBuffer).toBe(true);
            expect(position.edge).toBe('top');
        });

        it('snaps the bottom buffer zone to canvas height', () => {
            const position = app.constrainToBufferZone(100, CANVAS_HEIGHT + 10);

            expect(position.y).toBe(CANVAS_HEIGHT);
            expect(position.isInBuffer).toBe(true);
            expect(position.edge).toBe('bottom');
        });

        it('returns null y for positions outside both canvas and buffer zones', () => {
            expect(app.constrainToBufferZone(100, -(BUFFER_ZONE + 1)).y).toBeNull();
            expect(app.constrainToBufferZone(100, CANVAS_HEIGHT + BUFFER_ZONE + 1).y).toBeNull();
        });

        it('clamps x to canvas width', () => {
            expect(app.constrainToBufferZone(-10, 100).x).toBe(0);
            expect(app.constrainToBufferZone(900, 100).x).toBe(800);
        });
    });

    describe('aspect trail', () => {
        it('records trail samples while a loop is active', () => {
            const sound = app.getSound(1);
            sound.iconX = 100;
            sound.iconY = 200;
            sound.movements = [{ time: 0, x: 100, y: 200, sound: 1 }];
            sound.isLoopActive = true;

            app.updateAspectTrail(1);

            expect(app.aspectTrails[1]).toHaveLength(1);
            expect(app.aspectTrails[1][0]).toMatchObject({ x: 100, y: 200 });
        });

        it('clears the trail when the routine is inactive', () => {
            app.aspectTrails[1].push({ x: 1, y: 2, time: app.millis() });

            app.updateAspectTrail(1);

            expect(app.aspectTrails[1]).toHaveLength(0);
        });

        it('drops samples older than the trail window', () => {
            const trail = [{ x: 1, y: 2, time: 0 }, { x: 3, y: 4, time: 500 }];

            app.pruneAspectTrail(trail, 1500, app.getTrailSettings());

            expect(trail).toEqual([{ x: 3, y: 4, time: 500 }]);
        });

        it('enforces maxSamples by dropping oldest entries', () => {
            const trail = Array.from({ length: 95 }, (_, index) => ({
                x: index,
                y: index,
                time: index * 10
            }));

            app.pruneAspectTrail(trail, 10000, { ...app.getTrailSettings(), maxAgeMs: 100000 });

            expect(trail).toHaveLength(90);
            expect(trail[0].x).toBe(5);
        });
    });

    describe('shouldShowAspectTrail', () => {
        it('returns true when a loop is active with icon and movements', () => {
            const sound = app.getSound(1);
            sound.iconX = 10;
            sound.iconY = 20;
            sound.movements = [{ time: 0, x: 10, y: 20 }];
            sound.isLoopActive = true;

            expect(app.shouldShowAspectTrail(1)).toBe(true);
        });

        it('returns true while shift-recording the selected aspect', () => {
            const sound = app.getSound(1);
            sound.iconX = 10;
            sound.iconY = 20;
            sound.movements = [{ time: 0, x: 10, y: 20 }];
            app.recording = true;
            app.selectedSound = 1;

            expect(app.shouldShowAspectTrail(1)).toBe(true);
        });

        it('returns false without a placed icon', () => {
            const sound = app.getSound(1);
            sound.movements = [{ time: 0, x: 10, y: 20 }];
            sound.isLoopActive = true;

            expect(app.shouldShowAspectTrail(1)).toBe(false);
        });
    });

    describe('trailGhostAlpha', () => {
        it('applies a quadratic fade curve', () => {
            const settings = { alphaMax: 40 };

            expect(app.trailGhostAlpha(1, settings)).toBe(40);
            expect(app.trailGhostAlpha(0.5, settings)).toBe(10);
            expect(app.trailGhostAlpha(0, settings)).toBe(0);
        });
    });

    describe('updateAspectTrail edge cases', () => {
        it('skips samples that move less than minDistance', () => {
            const sound = app.getSound(1);
            sound.iconX = 100;
            sound.iconY = 200;
            sound.movements = [{ time: 0, x: 100, y: 200 }];
            sound.isLoopActive = true;
            app.aspectTrails[1].push({ x: 100, y: 200, time: app.millis() });

            sound.iconX = 101;
            sound.iconY = 201;
            app.updateAspectTrail(1);

            expect(app.aspectTrails[1]).toHaveLength(1);
        });

        it('clears the trail when behind trail rendering is disabled', () => {
            const sound = app.getSound(1);
            sound.iconX = 100;
            sound.iconY = 200;
            sound.movements = [{ time: 0, x: 100, y: 200 }];
            sound.isLoopActive = true;
            app.aspectTrails[1].push({ x: 50, y: 50, time: app.millis() });
            app.getTrailSettings().behindEnabled = false;

            app.updateAspectTrail(1);

            expect(app.aspectTrails[1]).toHaveLength(0);
        });
    });
});

describe('setLoopIndicatorState', () => {
    it('updates the loop indicator label and CSS class', () => {
        const { app } = loadApp();
        const indicator = app.document.getElementById('loopIndicator');

        app.setLoopIndicatorState('recording');
        expect(indicator.textContent).toBe('Rutyna: OPRACOWYWANIE');
        expect(indicator.classList.contains('routine-recording')).toBe(true);

        app.setLoopIndicatorState('idle');
        expect(indicator.textContent).toBe('trzymaj SHIFT by nagrać rutynę');
        expect(indicator.classList.contains('routine-recording')).toBe(false);
    });
});
