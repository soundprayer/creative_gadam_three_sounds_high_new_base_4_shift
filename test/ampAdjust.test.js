import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('amp adjust gesture', () => {
    let app;
    let pressKey;
    let releaseKey;

    beforeEach(() => {
        ({ app, pressKey, releaseKey } = loadApp());
    });

    function activateRoutine(soundId = 1, movements = null) {
        const sound = app.getSound(soundId);
        sound.movements = movements ?? [
            { time: 0, x: 100, y: 300, sound: soundId },
            { time: 500, x: 120, y: 280, sound: soundId }
        ];
        sound.loopDuration = 500;
        sound.isLoopActive = true;
        sound.isPlaying = true;
        sound.iconX = 100;
        sound.iconY = 300;
        sound.loopAnchorX = 100;
        sound.loopAnchorY = 300;
        sound.loopStartTime = app.millis();
        app.loopStartTimes[soundId] = sound.loopStartTime;
    }

    it('requires a placed icon and recorded movements', () => {
        pressKey(app.CONTROL);
        app.mouseX = 200;
        app.mouseY = 200;

        expect(app.tryPrepareAmpAdjustGesture()).toBe(false);

        activateRoutine(1);
        expect(app.tryPrepareAmpAdjustGesture()).toBe(true);
    });

    it('does not start while shift recording is active', () => {
        activateRoutine(1);
        app.recording = true;
        pressKey(app.CONTROL);

        expect(app.tryPrepareAmpAdjustGesture()).toBe(false);
    });

    it('shifts all movement Y values and loopAnchorY by drag delta', () => {
        activateRoutine(1);
        app.initAudio();
        pressKey(app.CONTROL);
        app.mouseX = 200;
        app.mouseY = 200;
        app.tryPrepareAmpAdjustGesture();

        app.mouseY = 150;
        app.applyAmpAdjustDrag();
        app.finishAmpAdjustGesture();

        const sound = app.getSound(1);
        expect(sound.movements[0].y).toBe(250);
        expect(sound.movements[1].y).toBe(230);
        expect(sound.loopAnchorY).toBe(250);
        expect(sound.movements[0].x).toBe(100);
        expect(sound.movements[1].x).toBe(120);
    });

    it('clamps Y values to the canvas height range', () => {
        activateRoutine(1, [{ time: 0, x: 100, y: 20, sound: 1 }]);
        app.initAudio();
        app.getSound(1).loopAnchorY = 20;
        pressKey(app.CONTROL);
        app.mouseY = 200;
        app.tryPrepareAmpAdjustGesture();

        app.mouseY = 600;
        app.applyAmpAdjustDrag();

        expect(app.getSound(1).movements[0].y).toBe(400);
        expect(app.getSound(1).loopAnchorY).toBe(400);
    });

    it('does nothing on release when ctrl click had no drag', () => {
        activateRoutine(1);
        pressKey(app.CONTROL);
        app.mouseY = 200;
        app.tryPrepareAmpAdjustGesture();

        app.finishAmpAdjustGesture();

        expect(app.getSound(1).movements[0].y).toBe(300);
        expect(app.getSound(1).routineBaseline).toBeNull();
    });

    it('updates routine baseline after a completed gesture', () => {
        activateRoutine(1);
        app.initAudio();
        pressKey(app.CONTROL);
        app.mouseY = 200;
        app.tryPrepareAmpAdjustGesture();
        app.mouseY = 170;
        app.applyAmpAdjustDrag();
        app.finishAmpAdjustGesture();

        const sound = app.getSound(1);
        expect(sound.routineBaseline).not.toBeNull();
        expect(sound.routineBaseline.movements[0].y).toBe(270);
        expect(sound.routineBaseline.movements[1].y).toBe(250);
    });

    it('blocks mouse override while the amp gesture is active', () => {
        activateRoutine(1);
        app.selectedSound = 1;
        app.ampAdjustGesture.active = true;
        app.ampAdjustGesture.sound = 1;
        app.mouseIsPressed = true;
        app.mouseX = 300;
        app.mouseY = 150;

        const target = app.resolveAudibleTarget(1);

        expect(target.source).toBe('routine');
    });
});

describe('ctrl + mousePressed guard', () => {
    let app;
    let pressKey;

    beforeEach(() => {
        ({ app, pressKey } = loadApp({ width: 800, height: 400 }));
        app.initAudio();
        app.started = true;
        app.selectedSound = 1;
        app.mouseX = 200;
        app.mouseY = 200;
    });

    it('does not place a sound when ctrl is held before first routine', () => {
        pressKey(app.CONTROL);

        app.mousePressed();

        expect(app.getSound(1).iconX).toBeNull();
        expect(app.getSound(1).isPlaying).toBe(false);
    });

    it('does not place a sound when ctrl is held with icon but no movements yet', () => {
        const sound = app.getSound(1);
        sound.iconX = 100;
        sound.iconY = 200;
        sound.isPlaying = true;
        pressKey(app.CONTROL);

        app.mousePressed();

        expect(sound.iconX).toBe(100);
        expect(sound.iconY).toBe(200);
        expect(sound.movements).toHaveLength(0);
    });

    it('prepares amp adjust instead of placing when ctrl is held with a routine', () => {
        const sound = app.getSound(1);
        sound.movements = [{ time: 0, x: 100, y: 200, sound: 1 }];
        sound.loopDuration = 500;
        sound.isLoopActive = true;
        sound.iconX = 100;
        sound.iconY = 200;
        pressKey(app.CONTROL);

        app.mousePressed();

        expect(app.ampAdjustGesture.pending).toBe(true);
        expect(sound.movements).toHaveLength(1);
    });

    it('does not start correction mode when ctrl is held', () => {
        const sound = app.getSound(1);
        sound.movements = [{ time: 0, x: 100, y: 200, sound: 1 }];
        sound.loopDuration = 500;
        sound.isLoopActive = true;
        sound.iconX = 100;
        sound.iconY = 200;
        app.isCorrectionMode = true;
        pressKey(app.CONTROL);

        app.mousePressed();

        expect(app.correctionGesture.active).toBe(false);
    });

    it('still places a sound on canvas click without ctrl', () => {
        app.mousePressed();

        expect(app.getSound(1).iconX).toBe(200);
        expect(app.getSound(1).iconY).toBe(200);
        expect(app.getSound(1).isPlaying).toBe(true);
    });
});
