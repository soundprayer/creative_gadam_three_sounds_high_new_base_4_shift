import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('audible', () => {
    let app;
    let advanceTime;

    beforeEach(() => {
        ({ app, advanceTime } = loadApp());
        app.initAudio();
    });

    function seedLoop(soundId, movements, duration) {
        const sound = app.getSound(soundId);
        sound.movements = movements.map((movement) => ({ ...movement, sound: soundId }));
        sound.loopDuration = duration;
        sound.isLoopActive = true;
        sound.isPlaying = true;
        sound.loopStartTime = app.millis();
        sound.iconX = movements[0].x;
        sound.iconY = movements[0].y;
        app.loopStartTimes[soundId] = sound.loopStartTime;
    }

    it('uses mouse override during loop playback', () => {
        seedLoop(1, [{ time: 0, x: 10, y: 20 }, { time: 500, x: 100, y: 200 }], 500);
        app.selectedSound = 1;
        app.mouseIsPressed = true;
        app.mouseX = 300;
        app.mouseY = 150;

        const target = app.resolveAudibleTarget(1);

        expect(target.source).toBe('override');
        expect(target).toMatchObject({ x: 300, y: 150 });
    });

        it('uses routine position when mouse is not overriding', () => {
            seedLoop(1, [{ time: 0, x: 10, y: 20 }, { time: 200, x: 50, y: 60 }], 200);
            app.mouseIsPressed = false;
            advanceTime(100);

            const target = app.resolveAudibleTarget(1);

            expect(target.source).toBe('routine');
            expect(target).toMatchObject({ x: 10, y: 20 });
        });

    it('records the same coordinates that were applied to the audible state', () => {
        seedLoop(1, [{ time: 0, x: 10, y: 20 }], 1000);
        app.selectedSound = 1;
        app.mouseIsPressed = true;
        app.mouseX = 220;
        app.mouseY = 180;
        app.syncAudibleState(1);

        const samples = [];
        app.appendAudibleSample(samples, 1);

        expect(samples).toHaveLength(1);
        expect(samples[0]).toMatchObject({ x: 220, y: 180, sound: 1 });
        expect(app.getSound(1).iconX).toBe(220);
        expect(app.getSound(1).iconY).toBe(180);
    });

    it('shift recording writes the audible state instead of raw mouse coordinates', () => {
        const sound = app.getSound(1);
        sound.isPlaying = true;
        sound.iconX = 111;
        sound.iconY = 222;
        app.recording = true;
        app.selectedSound = 1;
        app.mouseX = 999;
        app.mouseY = 999;

        app.recordAudibleRoutineSample(1, 150);

        expect(sound.movements).toHaveLength(1);
        expect(sound.movements[0]).toMatchObject({ time: 150, x: 111, y: 222, sound: 1 });
    });
});
