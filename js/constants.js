const FREQ_MIN = 40;
const FREQ_MAX = 1000;
const CANVAS_HEIGHT = 400;
const BUFFER_ZONE = 44;
const AMP_TRANSITION_TIME = 0.1;
const SOUND_COUNT = 4;
const SCALE_HIGHLIGHT_MS = 3000;
const NOTE_LABEL_Y = 20;
const TRAIL_DEFAULTS = {
    behindEnabled: true,
    aheadEnabled: true,
    maxAgeMs: 1300,
    aheadHorizonMs: 1400,
    sampleStepMs: 240,
    alphaMax: 54,
    ghostSize: 17,
    keyframeOnly: false,
    minDistance: 3,
    maxSamples: 90
};

const OSC_TYPES = {
    1: 'sine',
    2: 'triangle',
    3: 'square',
    4: 'sawtooth'
};

const CSS_COLOR_VARS = {
    1: '--color-green',
    2: '--color-red',
    3: '--color-blue',
    4: '--color-yellow'
};

const BASE_FREQ_MAP = {
    'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
    'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
    'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
};

const SCALE_PATTERNS = {
    'pentatonic': [0, 2, 4, 7, 9],
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor': [0, 2, 3, 5, 7, 8, 10],
    'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
    'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'locrian': [0, 1, 3, 5, 6, 8, 10],
    'whole_tone': [0, 2, 4, 6, 8, 10],
    'diminished': [0, 2, 3, 5, 6, 8, 9, 11],
    'arabic': [0, 1, 4, 5, 7, 8, 11],
    'japanese': [0, 2, 4, 7, 8],
    'gamelan': [0, 1, 3, 7, 8]
};

const NOTE_ORDER = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
