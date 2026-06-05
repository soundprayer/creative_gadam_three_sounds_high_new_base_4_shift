import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

const SCRIPT_ORDER = [
    'js/constants.js',
    'js/state.js',
    'js/scale.js',
    'js/audio.js',
    'js/ui.js',
    'js/loops.js',
    'js/overdub.js',
    'js/render.js',
    'js/input.js'
];

function createDom() {
    return new JSDOM(
        `<!DOCTYPE html>
        <html>
            <head></head>
            <body>
                <div id="loopIndicator"></div>
                <div id="playPauseStatus">Grać</div>
                <div id="startMessage"></div>
                <p class="info"></p>
                <div id="shortcutsModal" style="display:none"></div>
            </body>
        </html>`,
        { url: 'http://localhost' }
    );
}

function installCssVariables(document) {
    const root = document.documentElement;
    root.style.setProperty('--color-green', 'rgb(123, 0, 255)');
    root.style.setProperty('--color-red', 'rgb(255, 0, 234)');
    root.style.setProperty('--color-blue', 'rgb(0, 255, 225)');
    root.style.setProperty('--color-yellow', 'rgb(255, 234, 0)');
    root.style.setProperty('--color-scale-line', 'rgb(255, 255, 255)');
}

function createAppFacade(context) {
    return new Proxy(context, {
        get(target, prop, receiver) {
            if (typeof prop === 'symbol') {
                return Reflect.get(target, prop, receiver);
            }

            const name = String(prop);
            if (Object.prototype.hasOwnProperty.call(target, name) && target[name] !== undefined) {
                return target[name];
            }

            try {
                return vm.runInContext(name, context);
            } catch {
                return undefined;
            }
        },
        set(target, prop, value, receiver) {
            if (typeof prop === 'symbol') {
                return Reflect.set(target, prop, value, receiver);
            }

            const name = String(prop);
            vm.runInContext(`${name} = ${JSON.stringify(value)}`, context);
            return true;
        }
    });
}

function readConstant(context, name) {
    return vm.runInContext(name, context);
}
export function loadApp(options = {}) {
    const width = options.width ?? 800;
    const height = options.height ?? 400;
    let clockNow = options.startTime ?? 1000;

    const dom = createDom();
    const { window } = dom;
    installCssVariables(window.document);

    const context = vm.createContext({
        console,
        document: window.document,
        window,
        Blob: window.Blob,
        URL: window.URL,
        setTimeout: window.setTimeout.bind(window),
        clearTimeout: window.clearTimeout.bind(window),
        width,
        height,
        mouseX: 0,
        mouseY: 0,
        mouseIsPressed: false,
        millis: () => clockNow,
        constrain: (value, low, high) => Math.min(high, Math.max(low, value)),
        map: (value, start1, stop1, start2, stop2) =>
            start2 + ((stop2 - start2) * (value - start1)) / (stop1 - start1),
        dist: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
        key: '',
        keyCode: 0,
        SHIFT: 16,
        p5: {
            Oscillator: class {
                constructor() {
                    this.started = false;
                }

                start() {
                    this.started = true;
                }

                stop() {
                    this.started = false;
                }

                freq() {}

                amp() {}

                disconnect() {}
            },
            Reverb: class {
                set() {}

                drywet() {}

                process() {}
            },
            Part: class {
                addCue() {}

                loop() {}

                start() {}

                stop() {}
            }
        },
        getAudioContext: () => ({ resume: () => Promise.resolve() }),
        getComputedStyle: window.getComputedStyle.bind(window)
    });

    context.globalThis = context;

    const bundledSource = SCRIPT_ORDER.map((relativePath) => {
        const absolutePath = join(ROOT, relativePath);
        return readFileSync(absolutePath, 'utf8');
    }).join('\n;\n');

    vm.runInContext(bundledSource, context, { filename: 'app-bundle.js' });

    window.dispatchEvent(new window.Event('DOMContentLoaded'));

    return {
        app: createAppFacade(context),
        advanceTime(ms) {
            clockNow += ms;
        },
        setTime(ms) {
            clockNow = ms;
        },
        constants: {
            FREQ_MIN: readConstant(context, 'FREQ_MIN'),
            FREQ_MAX: readConstant(context, 'FREQ_MAX'),
            CANVAS_HEIGHT: readConstant(context, 'CANVAS_HEIGHT'),
            BUFFER_ZONE: readConstant(context, 'BUFFER_ZONE'),
            SOUND_COUNT: readConstant(context, 'SOUND_COUNT')
        }
    };
}
