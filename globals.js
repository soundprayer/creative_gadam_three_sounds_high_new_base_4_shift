// Global flags and state variables
let setupComplete = false;
let started = false;
let logging = false;
let debugMode = false;
let recording = false;
let isOverdubbing = false;
let isOverdubMode = false;
let hasOverdubStarted = false;
let selectedSound = 1;

let scaleType = 'pentatonic';
let rootNote = 'C';

let transitionTime1 = 0.5;
let transitionTime2 = 0.5;
let transitionTime3 = 0.5;
let transitionTime4 = 0.5;

let AMP_TRANSITION_TIME = 0.1;

const BUFFER_ZONE = 44;

let overridePositions = {1: null, 2: null, 3: null, 4: null};

let loopStartTimes = {1: 0, 2: 0, 3: 0, 4: 0};

let freqTransitionTimes = {
    1: 0.1,
    2: 0.1,
    3: 0.1,
    4: 0.1
};

let reverbDryWet = {
    1: 0.5,
    2: 0.5,
    3: 0.5,
    4: 0.5
};
// globals.js additions:
const CONTROL_BUFFER = 44;

let isPlaying1 = false;
let isPlaying2 = false;
let isPlaying3 = false;
let isPlaying4 = false;

let isLoop1Active = false;
let isLoop2Active = false;
let isLoop3Active = false;
let isLoop4Active = false;

let iconX1 = null, iconY1 = null;
let iconX2 = null, iconY2 = null;
let iconX3 = null, iconY3 = null;
let iconX4 = null, iconY4 = null;

let freq1 = 0, freq2 = 0, freq3 = 0, freq4 = 0;
let amp1 = 0, amp2 = 0, amp3 = 0, amp4 = 0;

let movements1 = [], movements2 = [], movements3 = [], movements4 = [];

let recordStartTime = 0;
let overdubMovements = [];
let overdubStartTime = null;

let loop1StartTime = 0, loop2StartTime = 0, loop3StartTime = 0, loop4StartTime = 0;
let loop1CurrentIndex = 0, loop2CurrentIndex = 0, loop3CurrentIndex = 0, loop4CurrentIndex = 0;
let loop1Duration = 0, loop2Duration = 0, loop3Duration = 0, loop4Duration = 0;
let lastLoopResetTime = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};
let isDragging1 = false, isDragging2 = false, isDragging3 = false, isDragging4 = false;
