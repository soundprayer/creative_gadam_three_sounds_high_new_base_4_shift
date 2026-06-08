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
        it('interpolates between keyframes when routineInterpolation is on', () => {
            app.appSettings.routineInterpolation = true;

            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 30, y: 40 },
                { time: 200, x: 50, y: 60 }
            ];
            sound.loopDuration = 200;

            expect(app.getRoutinePositionAtLoopTime(sound, 150)).toEqual({ x: 40, y: 50 });
            expect(app.getRoutinePositionAtLoopTime(sound, 0)).toEqual({ x: 10, y: 20 });
        });

        it('holds the previous keyframe when routineInterpolation is off', () => {
            app.appSettings.routineInterpolation = false;

            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 30, y: 40 },
                { time: 200, x: 50, y: 60 }
            ];

            expect(app.getRoutinePositionAtLoopTime(sound, 150)).toEqual({ x: 30, y: 40 });
        });

        it('lerps from the loop anchor toward the first keyframe on the first cycle when interpolation is on', () => {
            app.appSettings.routineInterpolation = true;

            const sound = app.getSound(1);
            sound.movements = [{ time: 500, x: 90, y: 90 }];
            sound.loopDuration = 500;
            sound.loopCycleCount = 0;
            sound.loopAnchorX = 10;
            sound.loopAnchorY = 20;

            expect(app.getRoutinePositionAtLoopTime(sound, 200)).toEqual({ x: 42, y: 48 });
        });

        it('uses the tail movement before the first keyframe on later cycles', () => {
            const sound = app.getSound(1);
            sound.movements = [{ time: 500, x: 90, y: 90 }];
            sound.loopCycleCount = 1;

            expect(app.getRoutinePositionAtLoopTime(sound, 200)).toEqual({ x: 90, y: 90 });
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

        it('preserves loop phase, anchor, and cycle count when doubling', () => {
            seedLoop(1, [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 30, y: 40 }
            ], 100);

            const sound = app.getSound(1);
            sound.loopAnchorX = 1;
            sound.loopAnchorY = 2;
            sound.loopCycleCount = 1;
            advanceTime(60);

            app.doubleLoop(1);

            expect(app.getLoopElapsedTime(1)).toBeCloseTo(60);
            expect(sound.loopCycleCount).toBe(1);
            expect(sound.loopAnchorX).toBe(1);
            expect(sound.loopAnchorY).toBe(2);
            expect(app.getLoopDuration(1)).toBe(200);
            expect(sound.loopCurrentIndex).toBe(1);
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
            expect(sound.loopCycleCount).toBe(1);
        });
    });

    describe('getLoopElapsedTime', () => {
        it('wraps elapsed time to the loop duration', () => {
            seedLoop(1, [{ time: 0, x: 1, y: 1 }, { time: 250, x: 2, y: 2 }], 250);
            advanceTime(380);

            expect(app.getLoopElapsedTime(1)).toBe(130);
        });
    });

    describe('getPositionBeforeFirstKeyframe', () => {
        it('uses the loop anchor during the first cycle', () => {
            const sound = {
                loopCycleCount: 0,
                loopAnchorX: 5,
                loopAnchorY: 6,
                movements: [{ x: 99, y: 88 }]
            };

            expect(app.getPositionBeforeFirstKeyframe(sound, sound.movements)).toEqual({ x: 5, y: 6 });
        });

        it('uses the last movement after the first cycle', () => {
            const sound = {
                loopCycleCount: 1,
                loopAnchorX: 5,
                loopAnchorY: 6,
                movements: [{ x: 99, y: 88 }]
            };

            expect(app.getPositionBeforeFirstKeyframe(sound, sound.movements)).toEqual({ x: 99, y: 88 });
        });
    });

    describe('startLoop anchors', () => {
        it('stores the current icon position as the loop anchor', () => {
            const sound = app.getSound(1);
            sound.iconX = 42;
            sound.iconY = 84;

            app.startLoop([{ time: 100, x: 10, y: 20 }], 1);

            expect(sound.loopAnchorX).toBe(42);
            expect(sound.loopAnchorY).toBe(84);
            expect(sound.loopCycleCount).toBe(0);
        });
    });

    describe('getLoopProgress', () => {
        it('returns elapsed time divided by loop duration', () => {
            seedLoop(1, [{ time: 0, x: 1, y: 1 }, { time: 400, x: 2, y: 2 }], 400);
            advanceTime(100);

            expect(app.getLoopProgress(1)).toBeCloseTo(0.25);
        });

        it('returns 0 when the loop is inactive', () => {
            expect(app.getLoopProgress(1)).toBe(0);
        });
    });

    describe('buildRoutineStepPath', () => {
        it('builds step segments between keyframes and closes the loop', () => {
            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 50, y: 20 },
                { time: 200, x: 50, y: 80 }
            ];
            sound.loopAnchorX = 10;
            sound.loopAnchorY = 20;
            sound.loopCycleCount = 0;

            const { points, jumpPoints } = app.buildRoutineStepPath(sound);

            expect(points).toEqual([
                { x: 10, y: 20 },
                { x: 50, y: 20 },
                { x: 50, y: 80 },
                { x: 10, y: 80 },
                { x: 10, y: 20 }
            ]);
            expect(jumpPoints).toEqual([
                { x: 50, y: 20 },
                { x: 50, y: 80 }
            ]);
        });

        it('skips jump markers when duplicated keyframes repeat the same position', () => {
            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 10, y: 20 },
                { time: 100, x: 30, y: 40 },
                { time: 200, x: 30, y: 40 },
                { time: 300, x: 10, y: 20 }
            ];
            sound.loopAnchorX = 10;
            sound.loopAnchorY = 20;
            sound.loopCycleCount = 0;

            const { jumpPoints } = app.buildRoutineStepPath(sound);

            expect(jumpPoints).toEqual([
                { x: 30, y: 40 },
                { x: 10, y: 20 }
            ]);
        });
    });

    describe('buildRoutineFutureSamples', () => {
        it('returns upcoming keyframes within the preview horizon', () => {
            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 10, y: 20 },
                { time: 500, x: 100, y: 20 },
                { time: 1000, x: 100, y: 80 }
            ];
            sound.loopDuration = 1000;
            sound.isLoopActive = true;

            const samples = app.buildRoutineFutureSamples(sound, 100, 900, 120, true);

            expect(samples).toEqual([
                { x: 100, y: 20, leadMs: 400 },
                { x: 10, y: 20, leadMs: 900 },
                { x: 100, y: 80, leadMs: 900 }
            ]);
        });

        it('wraps future samples across the loop boundary', () => {
            const sound = app.getSound(1);
            sound.movements = [{ time: 0, x: 10, y: 20 }];
            sound.loopDuration = 1000;
            sound.isLoopActive = true;

            const samples = app.buildRoutineFutureSamples(sound, 900, 500, 100, true);

            expect(samples).toEqual([{ x: 10, y: 20, leadMs: 100 }]);
        });

        it('samples routine positions ahead in time when keyframe-only mode is off', () => {
            const sound = app.getSound(1);
            sound.movements = [
                { time: 0, x: 0, y: 0 },
                { time: 100, x: 100, y: 0 },
                { time: 200, x: 100, y: 100 }
            ];
            sound.loopDuration = 200;
            sound.isLoopActive = true;

            const samples = app.buildRoutineFutureSamples(sound, 0, 150, 50, false);

            expect(samples).toEqual([
                { x: 0, y: 0, leadMs: 50 },
                { x: 100, y: 0, leadMs: 100 }
            ]);
        });
    });

    describe('snapSoundToRoutineFromMovements', () => {
        it('snaps using a movement snapshot instead of the live routine', () => {
            app.initAudio();

            const sound = app.getSound(1);
            sound.iconX = 100;
            sound.iconY = 100;
            seedLoop(1, [
                { time: 0, x: 10, y: 20 },
                { time: 200, x: 50, y: 60 }
            ], 200);

            const snapshot = [{ time: 0, x: 10, y: 20 }, { time: 200, x: 50, y: 60 }];
            sound.movements = [{ time: 0, x: 999, y: 999 }, { time: 200, x: 888, y: 888 }];

            app.snapSoundToRoutineFromMovements(1, snapshot, 100);

            expect(sound.iconX).toBe(10);
            expect(sound.iconY).toBe(20);
        });
    });
});
