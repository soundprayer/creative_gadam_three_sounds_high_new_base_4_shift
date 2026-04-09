// -------------------------------------
// 🧠 App State
// -------------------------------------
const NUM_SOUNDS = 4;

let debugMode = false;
let logging = false;
let recording = false;
let isPaused = false;

let isOverdubbing = false;
let overdubSound = 1;
let overdubPhaseStart = 0;
let overdubAnchorTime = 0;

let selectedSound = 1;
let scaleType = 'pentatonic';
let rootNote = 'C';

// -------------------------------------
// 🎧 Audio Transition & Reverb
// -------------------------------------
let AMP_TRANSITION_TIME = 0.1;

let freqTransitionTimes = [0.1, 0.1, 0.1, 0.1];

let reverbDryWet = [0.5, 0.5, 0.5, 0.5];

let reverbTime = 3;
let reverbDecay = 8;

// -------------------------------------
// 🔉 Per-sound slots (index 0 = sound 1, …)
// -------------------------------------
function createSoundSlot() {
    return {
        isPlaying: false,
        iconX: null,
        iconY: null,
        freq: 0,
        amp: 0,
        isLoopActive: false,
        isDragging: false,
        movements: [],
        loopStartTime: 0,
        loopCurrentIndex: 0,
        loopDuration: 0
    };
}

let soundSlots = [];
for (let i = 0; i < NUM_SOUNDS; i++) {
    soundSlots.push(createSoundSlot());
}

let oscillators = [];
let reverbs = [];

// -------------------------------------
// 🎙️ Recording / overdub scratch
// -------------------------------------
let recordStartTime = 0;
let overdubMovements = [];

let overridePositions = { 1: null, 2: null, 3: null, 4: null };

// -------------------------------------
// Step sequencer (16 steps × 4 voices)
// -------------------------------------
const SEQUENCER_NUM_STEPS = 16;

let sequencerSteps = [];
for (let r = 0; r < NUM_SOUNDS; r++) {
    sequencerSteps.push(new Array(SEQUENCER_NUM_STEPS).fill(false));
}

let sequencerBpm = 120;
let sequencerRunning = false;
let sequencerAccumMs = 0;
let sequencerLastMillisForClock = 0;
let sequencerLastStep = -1;
let sequencerHitTimeouts = [null, null, null, null];

// -------------------------------------
// 📐 Constants
// -------------------------------------
const BUFFER_ZONE = 44;
const CONTROL_BUFFER = 44;

// -------------------------------------
// Helpers (sound id 1–4)
// -------------------------------------
function soundSlot(soundId) {
    return soundSlots[soundId - 1];
}
