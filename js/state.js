function createSoundState() {
    return {
        osc: null,
        reverb: null,
        isPlaying: false,
        freq: 0,
        amp: 0,
        iconX: null,
        iconY: null,
        movements: [],
        isLoopActive: false,
        loopStartTime: 0,
        loopDuration: 0,
        loopCurrentIndex: 0,
        loopCycleCount: 0,
        loopAnchorX: null,
        loopAnchorY: null,
        isDragging: false,
        loopPart: null
    };
}

const sounds = {
    1: createSoundState(),
    2: createSoundState(),
    3: createSoundState(),
    4: createSoundState()
};

let selectedSound = 1;
let started = false;
let setupComplete = false;

let reverbTime = 3;
let reverbDecay = 2;
let reverbDryWet = { 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5 };

let recording = false;
let recordStartTime = 0;

let scaleType = 'pentatonic';
let rootNote = 'C';
let scaleChangedAt = 0;

let freqTransitionTimes = { 1: 0.1, 2: 0.1, 3: 0.1, 4: 0.1 };
let transitionTimes = { 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5 };

let logging = false;
let debugMode = false;

let loopStartTimes = { 1: 0, 2: 0, 3: 0, 4: 0 };

let overridePositions = { 1: null, 2: null, 3: null, 4: null };

function getSound(sound) {
    return sounds[sound];
}

function anySoundPlaying() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        if (sounds[i].isPlaying) return true;
    }
    return false;
}

function iconExists(sound) {
    return sounds[sound].iconX !== null;
}

function getCssColor(sound) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(CSS_COLOR_VARS[sound])
        .trim();
}

function freqToX(freq) {
    return width * (Math.log(freq / FREQ_MIN)) / (Math.log(FREQ_MAX / FREQ_MIN));
}

function xToFreq(x) {
    return FREQ_MIN * Math.pow(FREQ_MAX / FREQ_MIN, x / width);
}
