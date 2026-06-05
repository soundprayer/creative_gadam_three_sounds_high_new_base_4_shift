import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('loops', () => {
    let app;
    let advanceTime;

    beforeEach(() => {
        ({ app, advanceTime } = loadApp());
    });

    function seedLoop(soundId, movements, duration) {
        const sound = app.getSound(soundId);
        sound.movements = movements.map((movement) => ({ ...movement, sound: soundId }));
        sound.loopDuration = duration;
        sound.isLoopActive = true;
        sound.loopStartTime = app.millis();
        app.loopStartTimes[soundId] = sound.loopStartTime;
    }

    describe('findInsertIndex', () => {
        it('finds the first movement after the given time', () => {
            const movements = [{ time: 0 }, { time: 100 }, { time: 200 }];

            expect(app.findInsertIndex(movements, 50)).toBe(1);
            expect(app.findInsertIndex(movements, 200)).toBe(3);
        });

        it('returns the array length when time is after all movements', () => {
            const movements = [{ time: 10 }, { time: 20 }];

            expect(app.findInsertIndex(movements, 999)).toBe(2);
        });
    });

    describe('getRoutinePositionAtLoopTime', () => {
        it('returns the latest movement at or before loop time', () => {
            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 30, y: 40 },
                { time: 200, x: 50, y: 60 }
            ];

            expect(app.getRoutinePositionAtLoopTime(sound, 150)).toEqual({ x: 30, y: 40 });
            expect(app.getRoutinePositionAtLoopTime(sound, 0)).toEqual({ x: 10, y: 20 });
        });

        it('returns null when there are no movements', () => {
            expect(app.getRoutinePositionAtLoopTime(app.getSound(1), 0)).toBeNull();
        });
    });

    describe('startLoop', () => {
        it('activates a loop using the final movement timestamp as duration', () => {
            const movements = [
                { time: 0, x: 1, y: 2 },
                { time: 500, x: 3, y: 4 }
            ];

            app.startLoop(movements, 1);

            const sound = app.getSound(1);
            expect(sound.isLoopActive).toBe(true);
            expect(sound.loopDuration).toBe(500);
            expect(sound.loopCurrentIndex).toBe(0);
        });

        it('does nothing when there are no movements', () => {
            app.startLoop([], 1);

            expect(app.getSound(1).isLoopActive).toBe(false);
        });
    });

    describe('halveLoop', () => {
        it('keeps the first half when playback is in the first half of the loop', () => {
            seedLoop(1, [
                { time: 50, x: 1, y: 1 },
                { time: 150, x: 2, y: 2 },
                { time: 250, x: 3, y: 3 }
            ], 300);

            app.halveLoop(1);

            expect(app.getLoopDuration(1)).toBe(150);
            expect(app.getMovementsArray(1).map((movement) => movement.time)).toEqual([50]);
        });

        it('keeps and re-times the second half when playback is in the second half', () => {
            seedLoop(1, [
                { time: 50, x: 1, y: 1 },
                { time: 180, x: 2, y: 2 },
                { time: 260, x: 3, y: 3 }
            ], 300);
            advanceTime(200);

            app.halveLoop(1);

            expect(app.getLoopDuration(1)).toBe(150);
            expect(app.getMovementsArray(1).map((movement) => movement.time)).toEqual([30, 110]);
        });
    });

    describe('doubleLoop', () => {
        it('duplicates movements in the second half of the loop', () => {
            seedLoop(1, [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 30, y: 40 }
            ], 100);

            app.doubleLoop(1);

            const movements = app.getMovementsArray(1);
            expect(app.getLoopDuration(1)).toBe(200);
            expect(movements).toHaveLength(4);
            expect(movements[2]).toMatchObject({ time: 100, x: 10, y: 20 });
            expect(movements[3]).toMatchObject({ time: 200, x: 30, y: 40 });
        });
    });

    describe('syncLoopStateToNow', () => {
        it('wraps elapsed loop time and advances the movement index', () => {
            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 1, y: 1 },
                { time: 100, x: 2, y: 2 },
                { time: 200, x: 3, y: 3 }
            ];
            sound.loopDuration = 250;
            sound.isLoopActive = true;
            sound.loopStartTime = 1000;
            app.loopStartTimes[1] = 1000;
            advanceTime(380);

            const elapsed = app.syncLoopStateToNow(1);

            expect(elapsed).toBe(130);
            expect(sound.loopStartTime).toBe(1250);
            expect(sound.loopCurrentIndex).toBe(2);
        });
    });
});
