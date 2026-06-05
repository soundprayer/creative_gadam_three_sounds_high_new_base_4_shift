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
