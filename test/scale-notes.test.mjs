import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scaleNotesPath = join(__dirname, '..', 'core', 'scale-notes.js');

test('getScaleNotesData returns in-range notes for C pentatonic', () => {
    const code = readFileSync(scaleNotesPath, 'utf8');
    const sandbox = { globalThis: {} };
    sandbox.globalThis = sandbox;
    createContext(sandbox);
    runInContext(code, sandbox);

    assert.strictEqual(typeof sandbox.getScaleNotesData, 'function');
    const notes = sandbox.getScaleNotesData('C', 'pentatonic');
    assert.ok(Array.isArray(notes));
    assert.ok(notes.length > 0);
    for (const n of notes) {
        assert.ok(n.freq >= 40 && n.freq <= 1000);
        assert.ok(typeof n.name === 'string');
    }
});
