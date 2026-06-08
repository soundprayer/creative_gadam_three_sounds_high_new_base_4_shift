import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp } from './helpers/loadApp.js';

describe('trail settings UI', () => {
    let app;

    beforeEach(() => {
        ({ app } = loadApp());
    });

    it('syncs default trail settings to form controls', () => {
        app.syncTrailSettingsToDom();

        expect(app.document.getElementById('trailBehindEnabled').checked).toBe(true);
        expect(app.document.getElementById('trailAheadEnabled').checked).toBe(true);
        expect(app.document.getElementById('trailKeyframeOnly').checked).toBe(false);
        expect(app.document.getElementById('trailMaxAgeMs').value).toBe('1300');
        expect(app.document.getElementById('trailMaxAgeMsValue').textContent).toBe('1300');
        expect(app.document.getElementById('trailAheadHorizonMs').value).toBe('1400');
        expect(app.document.getElementById('trailSampleStepMs').value).toBe('240');
        expect(app.document.getElementById('trailAlphaMax').value).toBe('54');
        expect(app.document.getElementById('trailGhostSize').value).toBe('17');
    });

    it('reads checkbox and range changes back into trail settings', () => {
        app.document.getElementById('trailBehindEnabled').checked = false;
        app.document.getElementById('trailAheadEnabled').checked = false;
        app.document.getElementById('trailKeyframeOnly').checked = true;
        app.document.getElementById('trailMaxAgeMs').value = '1500';
        app.document.getElementById('trailAheadHorizonMs').value = '1200';
        app.document.getElementById('trailSampleStepMs').value = '120';
        app.document.getElementById('trailAlphaMax').value = '24';
        app.document.getElementById('trailGhostSize').value = '16';

        app.syncTrailSettingsFromDom();

        expect(app.getTrailSettings()).toMatchObject({
            behindEnabled: false,
            aheadEnabled: false,
            keyframeOnly: true,
            maxAgeMs: 1500,
            aheadHorizonMs: 1200,
            sampleStepMs: 120,
            alphaMax: 24,
            ghostSize: 16
        });
        expect(app.document.getElementById('trailMaxAgeMsValue').textContent).toBe('1500');
    });

    it('toggles the settings menu visibility', () => {
        const menu = app.document.getElementById('trailSettingsMenu');
        const toggle = app.document.getElementById('trailSettingsToggle');

        expect(menu.hidden).toBe(true);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');

        app.toggleTrailSettingsMenu();

        expect(menu.hidden).toBe(false);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');

        app.toggleTrailSettingsMenu();

        expect(menu.hidden).toBe(true);
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('clears aspect trails on resetAppState', () => {
        app.aspectTrails[1].push({ x: 1, y: 2, time: app.millis() });
        app.aspectTrails[3].push({ x: 3, y: 4, time: app.millis() });

        app.resetAppState();

        expect(app.aspectTrails[1]).toEqual([]);
        expect(app.aspectTrails[3]).toEqual([]);
    });
});
