import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('overdub / correction', () => {
    let app;
    let advanceTime;

    beforeEach(() => {
        ({ app, advanceTime } = loadApp());
    });

    function activateRoutine(soundId = 1) {
        const sound = app.getSound(soundId);
        sound.movements = [{ time: 0, x: 100, y: 200, sound: soundId }];
        sound.loopDuration = 1000;
        sound.isLoopActive = true;
        sound.iconX = 100;
        sound.iconY = 200;
        sound.loopStartTime = app.millis();
        app.loopStartTimes[soundId] = sound.loopStartTime;
    }

    describe('isInLoopTimeRange', () => {
        it('checks inclusive ranges within one loop cycle', () => {
            expect(app.isInLoopTimeRange(150, 100, 200, 1000)).toBe(true);
            expect(app.isInLoopTimeRange(50, 100, 200, 1000)).toBe(false);
        });

        it('supports ranges that wrap around the loop boundary', () => {
            expect(app.isInLoopTimeRange(950, 900, 100, 1000)).toBe(true);
            expect(app.isInLoopTimeRange(500, 900, 100, 1000)).toBe(false);
        });
    });

    describe('canCorrectSelectedSound', () => {
        it('requires an active loop, movements, and a placed icon', () => {
            expect(app.canCorrectSelectedSound()).toBe(false);

            activateRoutine(1);

            expect(app.canCorrectSelectedSound()).toBe(true);
        });
    });

    describe('correction mode lifecycle', () => {
        it('enters correction mode only when a routine can be corrected', () => {
            app.enterCorrectionMode();
            expect(app.isCorrectionMode).toBe(false);

            activateRoutine(1);
            app.enterCorrectionMode();

            expect(app.isCorrectionMode).toBe(true);
            expect(app.document.getElementById('loopIndicator').textContent).toBe('Rutyna: POPRAWKI');
        });

        it('returns to playing state after exiting correction mode', () => {
            activateRoutine(1);
            app.enterCorrectionMode();
            app.exitCorrectionMode();

            expect(app.isCorrectionMode).toBe(false);
            expect(app.document.getElementById('loopIndicator').textContent).toBe('Rutyna: ODTWARZA SIĘ');
        });
    });

    describe('finishCorrectionGesture', () => {
        it('replaces movements inside the corrected time range', () => {
            activateRoutine(1);
            app.getMovementsArray(1).push(
                { time: 200, x: 120, y: 220, sound: 1 },
                { time: 400, x: 140, y: 240, sound: 1 },
                { time: 600, x: 160, y: 260, sound: 1 }
            );
            app.setLoopDuration(1, 1000);
            app.isCorrectionMode = true;
            app.correctionGesture.active = true;
            app.correctionGesture.sound = 1;
            app.correctionGesture.points = [
                { time: 150, x: 300, y: 300, sound: 1 },
                { time: 450, x: 320, y: 310, sound: 1 }
            ];

            app.finishCorrectionGesture();

            const times = app.getMovementsArray(1).map((movement) => movement.time);
            expect(times).toEqual([0, 150, 450, 600]);
            expect(app.getMovementsArray(1)[1]).toMatchObject({ x: 300, y: 300 });
            expect(app.getMovementsArray(1)[2]).toMatchObject({ x: 320, y: 310 });
        });
    });
});

describe('toggleSelectedSound', () => {
    it('cycles through sound aspects', () => {
        const { app } = loadApp();

        app.selectedSound = 1;
        app.toggleSelectedSound();
        expect(app.selectedSound).toBe(2);

        app.selectedSound = 4;
        app.toggleSelectedSound();
        expect(app.selectedSound).toBe(1);
    });
});
