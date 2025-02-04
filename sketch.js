// import * as p5 from 'p5';
// declare var p5: any;

let osc1, osc2, osc3, osc4;
let isPlaying1 = false, isPlaying2 = false, isPlaying3 = false, isPlaying4 = false;
let freq1 = 0, freq2 = 0, freq3 = 0, freq4 = 0;
let amp1 = 0, amp2 = 0, amp3 = 0, amp4 = 0;
let iconX1 = null, iconY1 = null;
let iconX2 = null, iconY2 = null;
let iconX3 = null, iconY3 = null;
let iconX4 = null, iconY4 = null;
let started = false;
let selectedSound = 1;
let reverbTime = 3; // Initialize reverb time
let reverbDecay = 2; // Initialize reverb decay
let recording = false;
let isOverdubbing = false;  // Single overdub state
let overdubStartTime = null;
let overdubMovements = [];
let recordStartTime;
let movements1 = [], movements2 = [], movements3 = [], movements4 = [];
let loopInterval1, loopInterval2, loopInterval3, loopInterval4;

let isDragging1 = false;
let isDragging2 = false;
let isDragging3 = false;
let isDragging4 = false;

// Loop variables for Sound 1
let isLoop1Active = false;
let loop1StartTime = 0;
let loop1Duration = 0;
let loop1CurrentIndex = 0;

// Loop variables for Sound 2
let isLoop2Active = false;
let loop2StartTime = 0;
let loop2Duration = 0;
let loop2CurrentIndex = 0;

// Loop variables for Sound 3
let isLoop3Active = false;
let loop3StartTime = 0;
let loop3Duration = 0;
let loop3CurrentIndex = 0;

// Loop variables for Sound 4
let isLoop4Active = false;
let loop4StartTime = 0;
let loop4Duration = 0;
let loop4CurrentIndex = 0;

// Add to global variables
let isOverdubMode = false;
let hasOverdubStarted = false;

let logging = false; // Flag to track logging state

let debugMode = false; // New debug flag

let scaleType = 'pentatonic'; // Default scale

let rootNote = 'C'; // Default root

let transitionTime1 = 0.5;
let transitionTime5 = 0.5;
let transitionTime3 = 0.5;
let transitionTime4 = 0.5;

let freqTransitionTimes = {
    1: 0.1,
    2: 0.1,
    3: 0.1,
    4: 0.1
};

const AMP_TRANSITION_TIME = 0.1; // Fixed amplitude transition

let reverb1, reverb2, reverb3, reverb4;
let reverbDryWet = {
    1: 0.5,
    2: 0.5,
    3: 0.5,
    4: 0.5
};

function selectRootNote(value) {
    rootNote = value;
    window.scaleChanged = true;
    console.log("Selected root note:", rootNote);
}

function selectScale(value) {
    scaleType = value;
    window.scaleChanged = true;
    console.log("Selected scale:", scaleType);
}

function getScaleNotes() {
    const baseFreqMap = {
        'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
        'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
        'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    // Extended scale patterns
    const scalePatterns = {
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
    
    let rootFreq = baseFreqMap[rootNote];
    let pattern = scalePatterns[scaleType];
    let notes = [];
    
    // Generate notes for octaves 2 through 6
    for (let octave = 1; octave <= 6; octave++) {
        let octaveMultiplier = Math.pow(2, octave - 4); // Reference is octave 4
        
        pattern.forEach(interval => {
            let freq = rootFreq * Math.pow(2, interval/12) * octaveMultiplier;
            if (freq >= 40 && freq <= 1000) { // Stay within synth range
                let noteName = getNoteNameFromInterval(rootNote, interval, octave);
                notes.push({
                    name: noteName,
                    freq: freq
                });
            }
        });
    }
    
    return notes;
}

function getNoteNameFromInterval(root, interval, octave) {
    const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let rootIndex = noteOrder.indexOf(root);
    let noteIndex = (rootIndex + interval) % 12;
    return noteOrder[noteIndex] + octave;
}

let setupComplete = false;

function setup() {
    createCanvas(windowWidth, 400);
    
    // Create oscillators first
    osc1 = new p5.Oscillator('sine');
    osc2 = new p5.Oscillator('triangle');
    osc3 = new p5.Oscillator('square');
    osc4 = new p5.Oscillator('sawtooth');
    
    // Initialize audio context and reverb
    getAudioContext().resume().then(() => {
        setupComplete = true;
    });

    // Create individual reverbs
    reverb1 = new p5.Reverb();
    reverb2 = new p5.Reverb();
    reverb3 = new p5.Reverb();
    reverb4 = new p5.Reverb();
    
    // Set initial reverb parameters
    [reverb1, reverb2, reverb3, reverb4].forEach((rev, i) => {
        rev.set(3, 2); // Fixed reverb time and decay
        rev.drywet(reverbDryWet[i + 1]);
    });
    
    // Connect oscillators to their reverbs
    osc1.disconnect();
    osc2.disconnect();
    osc3.disconnect();
    osc4.disconnect();
    
    reverb1.process(osc1);
    reverb2.process(osc2);
    reverb3.process(osc3);
    reverb4.process(osc4);
}

function windowResized() {
    resizeCanvas(windowWidth, 400);
}

let overridePositions = {
    1: null,
    2: null,
    3: null,
    4: null
};

// Define buffer zone constants
const BUFFER_ZONE = 44;

// Central function to constrain positions
function constrainToBufferZone(x, y) {
    let position = {
        x: constrain(x, 0, width),
        y: y,
        isInBuffer: false,
        edge: null
    };
    
    // Check if in upper buffer zone (above canvas)
    if (y < 0 && y > -BUFFER_ZONE) {
        position.y = 0;  // Lock to top edge
        position.isInBuffer = true;
        position.edge = 'top';
    }
    // Check if in lower buffer zone (below canvas)
    else if (y > height && y < height + BUFFER_ZONE) {
        position.y = height;  // Lock to bottom edge
        position.isInBuffer = true;
        position.edge = 'bottom';
    }
    // Normal range
    else if (y >= 0 && y <= height) {
        position.y = constrain(y, 0, height);
    } else {
        // Outside soundboard and buffer zone
        position.y = null;
    }
    
    return position;
}

function draw() {
    background(1);

    // Draw semitransparent red vertical lines for notes
    drawNoteLines();

    // Highlight the selected sound in the menu
    let soundButtons = document.querySelectorAll('.sound-option');
    soundButtons.forEach((button, index) => {
        if (index + 1 === selectedSound) {
            button.style.backgroundColor = 'white';
        } else {
            button.style.backgroundColor = '';
        }
    });

    // Generalize the logic for all sounds
    if (mouseIsPressed && mouseX >= 0 && mouseX <= width) {
        let position = constrainToBufferZone(mouseX, mouseY);
        if (position.y !== null) {
            if (selectedSound === 1 && isPlaying1) {
                updateSound(1, position.x, position.y);
                if (recording) {
                    movements1.push({ time: millis() - recordStartTime, x: position.x, y: position.y, sound: 1 });
                }
            } else if (selectedSound === 2 && isPlaying2) {
                updateSound(2, position.x, position.y);
                if (recording) {
                    movements2.push({ time: millis() - recordStartTime, x: position.x, y: position.y, sound: 2 });
                }
            } else if (selectedSound === 3 && isPlaying3) {
                updateSound(3, position.x, position.y);
                if (recording) {
                    movements3.push({ time: millis() - recordStartTime, x: position.x, y: position.y, sound: 3 });
                }
            } else if (selectedSound === 4 && isPlaying4) {
                updateSound(4, position.x, position.y);
                if (recording) {
                    movements4.push({ time: millis() - recordStartTime, x: position.x, y: position.y, sound: 4 });
                }
            }
        }
    }

    // Reset drawing styles before drawing text
    noStroke();
    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-green').trim());
    textAlign(CENTER, CENTER);
    textSize(64);
    textFont('Press Start 2P');
    text(Math.round(freq1) + ' Hz', width / 2, height / 2 - 120);

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim());
    text(Math.round(freq2) + ' Hz', width / 2, height / 2 - 40);

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim());
    text(Math.round(freq3) + ' Hz', width / 2, height / 2 + 40);

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-yellow').trim());
    text(Math.round(freq4) + ' Hz', width / 2, height / 2 + 120);

    if (isPlaying1 && amp1 > 0.1) {
        let particleSize1 = map(Math.log(freq1), Math.log(40), Math.log(1000), 20, 2);
        let colorGreen = getComputedStyle(document.documentElement).getPropertyValue('--color-green').trim();
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha1 = map(amp1, 0.1, 1, 0, 255);
            fill(color(colorGreen).levels[0], color(colorGreen).levels[1], color(colorGreen).levels[2], alpha1);
            noStroke();
            rect(x, y, particleSize1, particleSize1);
        }
    }

    if (isPlaying2 && amp2 > 0.1) {
        let particleSize2 = map(Math.log(freq2), Math.log(40), Math.log(1000), 20, 2);
        let colorRed = getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim();
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha2 = map(amp2, 0.1, 1, 0, 255);
            fill(color(colorRed).levels[0], color(colorRed).levels[1], color(colorRed).levels[2], alpha2);
            noStroke();
            rect(x, y, particleSize2, particleSize2);
        }
    }

    if (isPlaying3 && amp3 > 0.1) {
        let particleSize3 = map(Math.log(freq3), Math.log(40), Math.log(1000), 20, 2);
        let colorBlue = getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim();
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha3 = map(amp3, 0.1, 1, 0, 255);
            fill(color(colorBlue).levels[0], color(colorBlue).levels[1], color(colorBlue).levels[2], alpha3);
            noStroke();
            rect(x, y, particleSize3, particleSize3);
        }
    }

    if (isPlaying4 && amp4 > 0.1) {
        let particleSize4 = map(Math.log(freq4), Math.log(40), Math.log(1000), 20, 2);
        let colorYellow = getComputedStyle(document.documentElement).getPropertyValue('--color-yellow').trim();
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha4 = map(amp4, 0.1, 1, 0, 255);
            fill(color(colorYellow).levels[0], color(colorYellow).levels[1], color(colorYellow).levels[2], alpha4);
            noStroke();
            rect(x, y, particleSize4, particleSize4);
        }
    }

    if (iconX1 !== null && iconY1 !== null) {
        fill(getComputedStyle(document.documentElement).getPropertyValue('--color-green').trim());
        noStroke();
        ellipse(iconX1, iconY1, 20, 20); // Draw a retro icon for the first sound
    }

    if (iconX2 !== null && iconY2 !== null) {
        fill(getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim());
        noStroke();
        triangle(iconX2 - 10, iconY2 + 10, iconX2 + 10, iconY2 + 10, iconX2, iconY2 - 10); // Draw a retro icon for the second sound
    }

    if (iconX3 !== null && iconY3 !== null) {
        fill(getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim());
        noStroke();
        rect(iconX3 - 10, iconY3 - 10, 20, 20); // Draw a retro icon for the third sound
    }

    if (iconX4 !== null && iconY4 !== null) {
        fill(getComputedStyle(document.documentElement).getPropertyValue('--color-yellow').trim());
        noStroke();
        ellipse(iconX4, iconY4, 20, 20); // Draw a retro icon for the fourth sound
    }

    // Draw a border around the selected sound's icon
    if (selectedSound === 1 && iconX1 !== null && iconY1 !== null) {
        stroke(255);
        strokeWeight(4);
        noFill();
        ellipse(iconX1, iconY1, 30, 30);
    } else if (selectedSound === 2 && iconX2 !== null && iconY2 !== null) {
        stroke(255);
        strokeWeight(4);
        noFill();
        triangle(iconX2 - 10, iconY2 + 10, iconX2 + 10, iconY2 + 10, iconX2, iconY2 - 10);
    } else if (selectedSound === 3 && iconX3 !== null && iconY3 !== null) {
        stroke(255);
        strokeWeight(4);
        noFill();
        rect(iconX3 - 10, iconY3 - 10, 20, 20);
    } else if (selectedSound === 4 && iconX4 !== null && iconY4 !== null) {
        stroke(255);
        strokeWeight(4);
        noFill();
        ellipse(iconX4, iconY4, 30, 30);
    }

    // Ensure the play/pause status is updated correctly
    let playPauseStatus = document.getElementById('playPauseStatus');
    if (isPlaying1 || isPlaying2 || isPlaying3 || isPlaying4) {
        playPauseStatus.textContent = 'Odpocząć';
    } else {
        playPauseStatus.textContent = 'Grać';
    }

    // Update loops
    if (mouseIsPressed) {
        // Override sound position if mouse is within canvas
        if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            if (selectedSound && iconExists(selectedSound)) {
                overridePositions[selectedSound] = { x: mouseX, y: mouseY };
                updateSound(selectedSound, mouseX, mouseY);
            }
        }
    } else {
        // Clear override when mouse released
        overridePositions = { 1: null, 2: null, 3: null, 4: null };
    }
    
    // Update loops only if not being overridden
    if (!overridePositions[1]) updateLoop1();
    if (!overridePositions[2]) updateLoop2();
    if (!overridePositions[3]) updateLoop3();
    if (!overridePositions[4]) updateLoop4();

    if (isOverdubbing && mouseIsPressed) {
        // Record held position even without drag
        let loopDuration = getLoopDuration(selectedSound);
        let currentPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
        
        overdubMovements.push({
            time: currentPosition,
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        });
    }

    if (overdubState.isActive && mouseIsPressed) {
        recordOverdubPosition();
    }
}

function drawNoteLines() {
    let notes = getScaleNotes();
    stroke(255, 0, 0, 127);
    strokeWeight(1);
    
    notes.forEach(note => {
        let minFreq = 40;
        let maxFreq = 1000;
        let x = width * (Math.log(note.freq/minFreq)) / (Math.log(maxFreq/minFreq));
        
        if (x >= 0 && x <= width) {
            // Add animation class to lines
            push();
            if (window.scaleChanged) {
                stroke(255, 0, 0, map(sin(frameCount * 0.1), -1, 1, 50, 200));
            }
            line(x, 0, x, height);
            pop();
            
            fill(255, 0, 0, 127);
            textSize(12);
            text(note.name, x, 20);
        }
    });
    
    // Reset scale changed flag after a few seconds
    if (window.scaleChanged && frameCount % 60 === 0) {
        window.scaleChanged = false;
    }
}

function updateSound(sound, x, y) {
    // Add validation for y parameter
    if (y === undefined || y === null) {
        y = height; // Default to bottom of canvas (silence)
    }
    
    // Ensure height is defined
    if (!height) return;
    
    // Safe mapping with validated parameters
    let amp = map(y, height, 0, 0, 0.8);
    
    let minFreq = 40;
    let maxFreq = 1000;
    let freq = minFreq * Math.pow(maxFreq/minFreq, x/width);
    
    if (sound === 1) {
        osc1.freq(freq, freqTransitionTimes[1]);  // Use global transition time
        osc1.amp(amp, AMP_TRANSITION_TIME);
        iconX1 = x;
        iconY1 = y;
        freq1 = freq;
        amp1 = amp;
    } else if (sound === 2) {
        osc2.freq(freq, freqTransitionTimes[2]);  // Use global transition time
        osc2.amp(amp, AMP_TRANSITION_TIME);
        iconX2 = x;
        iconY2 = y;
        freq2 = freq;
        amp2 = amp;
    } else if (sound === 3) {
        osc3.freq(freq, freqTransitionTimes[3]);  // Use global transition time
        osc3.amp(amp, AMP_TRANSITION_TIME);
        iconX3 = x;
        iconY3 = y;
        freq3 = freq;
        amp3 = amp;
    } else if (sound === 4) {
        osc4.freq(freq, freqTransitionTimes[4]);  // Use global transition time
        osc4.amp(amp, AMP_TRANSITION_TIME);
        iconX4 = x;
        iconY4 = y;
        freq4 = freq;
        amp4 = amp;
    }
}

function updateTransitionTime(sound, value) {
    switch(sound) {
        case 1: transitionTime1 = parseFloat(value); break;
        case 2: transitionTime2 = parseFloat(value); break;
        case 3: transitionTime3 = parseFloat(value); break;
        case 4: transitionTime4 = parseFloat(value); break;
    }
}

function updateFreqTransitionTime(sound, value) {
    freqTransitionTimes[sound] = parseFloat(value);
}

// Sound State Management
const SOUND_STATE = {
    IDLE: 'idle',
    ACTIVE: 'active',
    DRAGGING: 'dragging',
    OVERDUBBING: 'overdubbing'
};

let soundStates = {
    1: { state: SOUND_STATE.IDLE, iconX: null, iconY: null, isPlaying: false, lastUpdate: 0 },
    2: { state: SOUND_STATE.IDLE, iconX: null, iconY: null, isPlaying: false, lastUpdate: 0 },
    3: { state: SOUND_STATE.IDLE, iconX: null, iconY: null, isPlaying: false, lastUpdate: 0 },
    4: { state: SOUND_STATE.IDLE, iconX: null, iconY: null, isPlaying: false, lastUpdate: 0 }
};

// Event Handlers
function handleMousePress(sound) {
    let state = soundStates[sound];
    state.lastUpdate = millis();
    
    if (isOverdubbing) {
        state.state = SOUND_STATE.OVERDUBBING;
        startOverdubRecording(sound);
    } else if (state.isPlaying) {
        state.state = SOUND_STATE.DRAGGING;
    } else {
        state.state = SOUND_STATE.ACTIVE;
        state.isPlaying = true;
    }
    
    updateSoundPosition(sound, mouseX, mouseY);
}

function handleMouseDrag(sound) {
    let state = soundStates[sound];
    if (state.state !== SOUND_STATE.IDLE) {
        updateSoundPosition(sound, mouseX, mouseY);
        
        if (state.state === SOUND_STATE.OVERDUBBING) {
            recordOverdubPosition(sound, mouseX, mouseY);
        }
    }
}

function handleMouseRelease(sound) {
    let state = soundStates[sound];
    
    if (state.state === SOUND_STATE.OVERDUBBING) {
        finishOverdubRecording(sound);
    }
    
    if (!state.isPlaying && state.state !== SOUND_STATE.OVERDUBBING) {
        resetSoundState(sound);
    } else {
        state.state = SOUND_STATE.ACTIVE;
    }
}

// Mouse Event Integration
function mousePressed() {
    if (selectedSound && mouseY < height - CONTROL_BUFFER) {
        handleMousePress(selectedSound);
    }
}

function mouseDragged() {
    if (selectedSound && mouseY < height - CONTROL_BUFFER) {
        handleMouseDrag(selectedSound);
    }
}

function mouseReleased() {
    if (selectedSound) {
        handleMouseRelease(selectedSound);
    }
}

// Remove oscillator start from togglePlay
function togglePlay() {
    let playPauseStatus = document.getElementById('playPauseStatus');
    let infoText = document.querySelector('.info');
    
    if (isPlaying1 || isPlaying2 || isPlaying3 || isPlaying4) {
        // Stop only active oscillators
        if (isPlaying1) osc1.stop();
        if (isPlaying2) osc2.stop();
        if (isPlaying3) osc3.stop();
        if (isPlaying4) osc4.stop();
        isPlaying1 = false;
        isPlaying2 = false;
        isPlaying3 = false;
        isPlaying4 = false;
        playPauseStatus.textContent = 'Graj';
        infoText.classList.add('blinking');
    } else {
        // Start only existing oscillators
        if (iconX1 !== null) {
            osc1.start();
            isPlaying1 = true;
        }
        if (iconX2 !== null) {
            osc2.start();
            isPlaying2 = true;
        }
        if (iconX3 !== null) {
            osc3.start();
            isPlaying3 = true;
        }
        if (iconX4 !== null) {
            osc4.start();
            isPlaying4 = true;
        }
        playPauseStatus.textContent = 'Odpocząć';
        infoText.classList.remove('blinking');
    }
}

// Update mousePressed to only start oscillators when first placed
function mousePressed() {
    if (!started) {
        getAudioContext().resume().then(() => {
            started = true;
            let startMessage = document.getElementById('startMessage');
            startMessage.style.display = 'none';
            
            // Re-initialize reverb if needed
            if (!setupComplete) {
                setup();
            }
        });
    }
    
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Check if clicking on any existing icon
        let clickedOnIcon = false;
        if (iconX1 !== null && iconY1 !== null && dist(mouseX, mouseY, iconX1, iconY1) < 20) {
            selectedSound = 1;
            clickedOnIcon = true;
        } else if (iconX2 !== null && iconY2 !== null && dist(mouseX, mouseY, iconX2, iconY2) < 20) {
            selectedSound = 2;
            clickedOnIcon = true;
        } else if (iconX3 !== null && iconY3 !== null && dist(mouseX, mouseY, iconX3, iconY3) < 20) {
            selectedSound = 3;
            clickedOnIcon = true;
        } else if (iconX4 !== null && iconY4 !== null && dist(mouseX, mouseY, iconX4, iconY4) < 20) {
            selectedSound = 4;
            clickedOnIcon = true;
        }
        
        // Only start new sounds if we didn't click on an existing icon
        if (!clickedOnIcon) {
            if (selectedSound === 1 && iconX1 === null) {
                osc1.start();
                isPlaying1 = true;
                iconX1 = mouseX;
                iconY1 = mouseY;
                updateSound(1, mouseX, mouseY);
            }
            if (selectedSound === 2 && iconX2 === null) {
                osc2.start();
                isPlaying2 = true;
                iconX2 = mouseX;
                iconY2 = mouseY;
                updateSound(2, mouseX, mouseY);
            }
            if (selectedSound === 3 && iconX3 === null) {
                osc3.start();
                isPlaying3 = true;
                iconX3 = mouseX;
                iconY3 = mouseY;
                updateSound(3, mouseX, mouseY);
            }
            if (selectedSound === 4 && iconX4 === null) {
                osc4.start();
                isPlaying4 = true;
                iconX4 = mouseX;
                iconY4 = mouseY;
                updateSound(4, mouseX, mouseY);
            }
        }

        // Record the position even if the mouse is not dragged
        if (recording) {
            // console.log(`Recording movement for sound ${selectedSound} at (${mouseX}, ${mouseY})`);
            let currentTime = millis() - recordStartTime;
            if (isOverdubbing) {
                // Add new movements to the existing movements array at the correct position
                let movements= getMovementsArray(selectedSound);
                let loopStartTime = getLoopStartTime(selectedSound);
                let loopElapsedTime = (millis() - loopStartTime) % getLoopDuration(selectedSound);
                let index = findInsertIndex(movements, loopElapsedTime);
                movements.splice(index, 1, { time: loopElapsedTime, x: mouseX, y: mouseY, sound: selectedSound });
            } else {
                // Normal recording
                if (selectedSound === 1) {
                    movements1.push({ time: currentTime, x: mouseX, y: mouseY, sound: 1 });
                } else if (selectedSound === 2) {
                    movements2.push({ time: currentTime, x: mouseX, y: mouseY, sound: 2 });
                } else if (selectedSound === 3) {
                    movements3.push({ time: currentTime, x: mouseX, y: mouseY, sound: 3 });
                } else if (selectedSound === 4) {
                    movements4.push({ time: currentTime, x: mouseX, y: mouseY, sound: 4 });
                }
            }
        }
    }

    if (isOverdubMode && !hasOverdubStarted) {
        hasOverdubStarted = true;
        overdubStartTime = millis();
        let loopDuration = getLoopDuration(selectedSound);
        overdubStartPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
    }

    if (isOverdubbing && overdubStartTime === null) {
        overdubStartTime = millis();
        overdubMovements = [];
        let loopDuration = getLoopDuration(selectedSound);
        let currentPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
        overdubMovements.push({
            time: currentPosition,
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        });
    }

    if (isOverdubbing) {
        let loopDuration = getLoopDuration(selectedSound);
        currentOverdubPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
        
        overdubMovements.push({
            time: currentOverdubPosition,
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        });
    }

    if (isOverdubbing) {
        let loopDuration = getLoopDuration(selectedSound);
        overdubState.startTime = millis();
        overdubState.loopPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
        
        // Clear future movements
        let movements = getMovementsArray(selectedSound);
        movements = movements.filter(mov => {
            let normalizedTime = mov.time % loopDuration;
            return normalizedTime < overdubState.loopPosition;
        });
        setMovementsArray(selectedSound, movements);
        
        // Record initial position
        recordPosition(mouseX, mouseY);
    }
}

function mouseDragged() {
    if (overdubState.isActive && mouseIsPressed) {
        recordOverdubPosition();
    }
}

function mouseReleased() {
    if (selectedSound === 1) {
        isDragging1 = false;
    } else if (selectedSound === 2) {
        isDragging2 = false;
    } else if (selectedSound === 3) {
        isDragging3 = false;
    } else if (selectedSound === 4) {
        isDragging4 = false;
    }
}

function keyPressed() {
    if (key === ' ') { // Check if the space key is pressed
        togglePlay();
    } else if (keyCode === SHIFT) { // Check if the 'SHIFT' key is pressed
        let loopIndicator = document.getElementById('loopIndicator');
        // Start recording
        recording = true;
        recordStartTime = millis();
        console.log("Recording started");
        if (selectedSound === 1) {
            movements1 = [];
            isLoop1Active = false; // Stop the loop
            console.log("Loop 1 stopped");
        } else if (selectedSound === 2) {
            movements2 = [];
            isLoop2Active = false; // Stop the loop
            console.log("Loop 2 stopped");
        } else if (selectedSound === 3) {
            movements3 = [];
            isLoop3Active = false; // Stop the loop
            console.log("Loop 3 stopped");
        } else if (selectedSound === 4) {
            movements4 = [];
            isLoop4Active = false; // Stop the loop
            console.log("Loop 4 stopped");
        }
        loopIndicator.textContent = 'Rutyna: OPRACOWYWANIE';
    } else if (key === 'D' || key === 'd') { // Changed to 'D'
        if (mouseIsPressed) {
            overdubStartTime = millis();
            recording = true;
            isOverdubbing = true;
            overdubMovements = [];
            let loopIndicator = document.getElementById('loopIndicator');
            loopIndicator.textContent = 'Rutyna: POPRAWIANIE';
        }
    } else if (key === 'Z' || key === 'z') {
        halveLoop(selectedSound);
    } else if (key === 'X' || key === 'x') {
        doubleLoop(selectedSound);
    } else if (key === 'Q' || key === 'q') { // Changed from 'A' to 'Q'
        toggleSelectedSound();
    } else if (key === 'L' || key === 'l') {
        toggleLogging();
    } else if (key === 'P' || key === 'p') {
        togglePlay();
    }

    if (key === 'D' || key === 'd') {
        isOverdubMode = true;
        hasOverdubStarted = false;
        overdubMovements = [];
    }

    if (key === 'D' || key === 'd') {
        isOverdubbing = true;
        overdubState.buffer = [];
        let loopIndicator = document.getElementById('loopIndicator');
        loopIndicator.textContent = 'Rutyna: POPRAWIANIE';
    }

    if (key === 'D' || key === 'd') {
        startOverdub();
    }
}

function startOverdubRecording() {
    recording = true;
    isOverdubbing = true;
    overdubMovements = [];
    let loopIndicator = document.getElementById('loopIndicator');
    loopIndicator.textContent = 'Rutyna: POPRAWIANIE';
}

function toggleSelectedSound() {
    selectedSound = (selectedSound % 4) + 1; // Cycle through sounds 1 to 4
}

function keyReleased() {
    if (keyCode === SHIFT) { // Check if the 'SHIFT ' key is released
        let loopIndicator = document.getElementById('loopIndicator');
        // Stop recording and start looping
        recording = false;
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
        console.log("Recording stopped, starting loop");
        if (selectedSound === 1) {
            movements1.push({ time: millis() - recordStartTime, x: iconX1, y: iconY1, sound: 1 }); // Ensure the last position is recorded
            console.log("Final movement for sound 1 recorded at", movements1[movements1.length - 1]);
            startLoop(movements1, 1);
        } else if (selectedSound === 2) {
            movements2.push({ time: millis() - recordStartTime, x: iconX2, y: iconY2, sound: 2 }); // Ensure the last position is recorded
            console.log("Final movement for sound 2 recorded at", movements2[movements2.length - 1]);
            startLoop(movements2, 2);
        } else if (selectedSound === 3) {
            movements3.push({ time: millis() - recordStartTime, x: iconX3, y: iconY3, sound: 3 }); // Ensure the last position is recorded
            console.log("Final movement for sound 3 recorded at", movements3[movements3.length - 1]);
            startLoop(movements3, 3);
        } else if (selectedSound === 4) {
            movements4.push({ time: millis() - recordStartTime, x: iconX4, y: iconY4, sound: 4 }); // Ensure the last position is recorded
            console.log("Final movement for sound 4 recorded at", movements4[movements4.length - 1]);
            startLoop(movements4, 4);
        }
        if (logging) {
            saveMovementsToFile(); // Automatically save movements to file if logging is enabled
        } // Automatically save movements to file
    } else if (key === 'D' || key === 'd') {
        let originalMovements = getMovementsArray(selectedSound);
        if (overdubMovements.length > 0) {
            originalMovements.push(...overdubMovements);
            originalMovements.sort((a, b) => a.time - b.time);
            setMovementsArray(selectedSound, originalMovements);
            overdubMovements = [];  // Clear after merge
        }
        isOverdubbing = false;
        overdubStartTime = null;
    } else if (key === 'P' || key === 'p') {
        togglePlay();
    }

    if (key === 'D' || key === 'd') {
        if (overdubMovements.length > 0) {
            let originalMovements = getMovementsArray(selectedSound);
            let endPosition = getCurrentLoopPosition(selectedSound);
            
            // Remove old movements in range
            originalMovements = originalMovements.filter(mov => {
                let pos = mov.time % getLoopDuration(selectedSound);
                return pos < overdubStartPosition || pos > endPosition;
            });
            
            // Add new movements
            originalMovements.push(...overdubMovements);
            originalMovements.sort((a, b) => a.time - b.time);
            setMovementsArray(selectedSound, originalMovements);
        }
        isOverdubbing = false;
        overdubStartPosition = null;
        overdubMovements = [];
    }

    if (key === 'D' || key === 'd') {
        if (hasOverdubStarted && overdubMovements.length > 0) {
            mergeOverdubMovements();
        }
        isOverdubMode = false;
        hasOverdubStarted = false;
        overdubStartTime = null;
        overdubMovements = [];
    }

    if (key === 'D' || key === 'd') {
        if (overdubMovements.length > 0) {
            let originalMovements = getMovementsArray(selectedSound);
            originalMovements.push(...overdubMovements);
            originalMovements.sort((a, b) => a.time - b.time);
            setMovementsArray(selectedSound, originalMovements);
        }
        isOverdubbing = false;
        overdubStartTime = null;
        overdubMovements = [];
        let loopIndicator = document.getElementById('loopIndicator');
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
    }

    if (key === 'D' || key === 'd') {
        if (overdubState.buffer.length > 0) {
            let movements = getMovementsArray(overdubState.sound);
            movements.push(...overdubState.buffer);
            movements.sort((a, b) => a.time - b.time);
            setMovementsArray(overdubState.sound, movements);
        }
        
        isOverdubbing = false;
        overdubState = {
            startTime: null,
            loopPosition: null,
            sound: null,
            buffer: []
        };
        
        let loopIndicator = document.getElementById('loopIndicator');
        loopIndicator.textContent = 'Rutyna: ODTWARZA SIĘ';
    }

    if (key === 'D' || key === 'd') {
        endOverdub();
    }
}

function setMovementsArray(sound, movements) {
    if (sound === 1) movements1 = movements;
    else if (sound === 2) movements2 = movements;
    else if (sound === 3) movements3 = movements;
    else if (sound === 4) movements4 = movements;
}

// Updated playMovements function
function playMovements(movements, sound) {
    let part = new p5.Part();
    movements.forEach(movement => {
        let cueTime = movement.time / 1000; // Convert to seconds
        part.addCue(cueTime, () => {
            if ((sound === 1 && !isDragging1) || (sound === 2 && !isDragging2) || (sound === 3 && !isDragging3) || (sound === 4 && !isDragging4)) {
                updateSound(movement.sound, movement.x, movement.y);
            }
        });
    });
    part.loop();
    part.start();
    if (sound === 1) {
        if (loopInterval1) {
            loopInterval1.stop();
        }
        loopInterval1 = part; // Correct assignment without 'let'
    } else if (sound === 2) {
        if (loopInterval2) {
            loopInterval2.stop();
        }
        loopInterval2 = part; // Correct assignment without 'let'
    } else if (sound === 3) {
        if (loopInterval3) {
            loopInterval3.stop();
        }
        loopInterval3 = part; // Correct assignment without 'let'
    } else if (sound === 4) {
        if (loopInterval4) {
            loopInterval4.stop();
        }
        loopInterval4 = part; // Correct assignment without 'let'
    }
}

function startLoop(movements, sound) {
    loopStartTimes[sound] = millis();
    if (movements.length === 0) {
        console.log("No movements recorded, cannot start loop");
        return;
    }
    let loopDuration = movements[movements.length - 1].time;
    console.log("Starting loop with duration:", loopDuration);
    if (sound === 1) {
        loop1StartTime = millis();
        loop1Duration = loopDuration;
        loop1CurrentIndex = 0;
        isLoop1Active = true;
    } else if (sound === 2) {
        loop2StartTime = millis();
        loop2Duration = loopDuration;
        loop2CurrentIndex = 0;
        isLoop2Active = true;
    } else if (sound === 3) {
        loop3StartTime = millis();
        loop3Duration = loopDuration;
        loop3CurrentIndex = 0;
        isLoop3Active = true;
    } else if (sound === 4) {
        loop4StartTime = millis();
        loop4Duration = loopDuration;
        loop4CurrentIndex = 0;
        isLoop4Active = true;
    }
}

function updateLoops() {
    updateLoop1();
    updateLoop2();
    updateLoop3();
    updateLoop4();
    if (recording) {
        console.log("Recording in progress, loops should not be active");
    }
}

function updateLoop1() {
    if (!isLoop1Active || isDragging1) return;
    let elapsedTime = millis() - loop1StartTime;
    while (loop1CurrentIndex < movements1.length && movements1[loop1CurrentIndex].time <= elapsedTime) {
        let movement = movements1[loop1CurrentIndex];
        updateSound(1, movement.x, movement.y);
        loop1CurrentIndex++;
    }
    if (elapsedTime >= loop1Duration) {
        loop1StartTime = millis();
        loop1CurrentIndex = 0;
    }
    // console.log("Loop 1 updated, elapsedTime:", elapsedTime, "loop1Duration:", loop1Duration);
}

function updateLoop2() {
    if (!isLoop2Active || isDragging2) return;
    let elapsedTime = millis() - loop2StartTime;
    while (loop2CurrentIndex < movements2.length && movements2[loop2CurrentIndex].time <= elapsedTime) {
        let movement = movements2[loop2CurrentIndex];
        updateSound(2, movement.x, movement.y);
        loop2CurrentIndex++;
    }
    if (elapsedTime >= loop2Duration) {
        loop2StartTime = millis();
        loop2CurrentIndex = 0;
    }
    // console.log("Loop 2 updated, elapsedTime:", elapsedTime, "loop2Duration:", loop2Duration);
}

function updateLoop3() {
    if (!isLoop3Active || isDragging3) return;
    let elapsedTime = millis() - loop3StartTime;
    while (loop3CurrentIndex < movements3.length && movements3[loop3CurrentIndex].time <= elapsedTime) {
        let movement = movements3[loop3CurrentIndex];
        updateSound(3, movement.x, movement.y);
        loop3CurrentIndex++;
    }
    if (elapsedTime >= loop3Duration) {
        loop3StartTime = millis();
        loop3CurrentIndex = 0;
    }
    // console.log("Loop 3 updated, elapsedTime:", elapsedTime, "loop3Duration:", loop3Duration);
}

function updateLoop4() {
    if (!isLoop4Active || isDragging4) return;
    let elapsedTime = millis() - loop4StartTime;
    while (loop4CurrentIndex < movements4.length && movements4[loop4CurrentIndex].time <= elapsedTime) {
        let movement = movements4[loop4CurrentIndex];
        updateSound(4, movement.x, movement.y);
        loop4CurrentIndex++;
    }
    if (elapsedTime >= loop4Duration) {
        loop4StartTime = millis();
        loop4CurrentIndex = 0;
    }
    // console.log("Loop 4 updated, elapsedTime:", elapsedTime, "loop4Duration:", loop4Duration);
}

function getMovementsArray(sound) {
    if (sound === 1) return movements1;
    else if (sound === 2) return movements2;
    else if (sound === 3) return movements3;
    else if (sound === 4) return movements4;
}

function findInsertIndex(movements, time) {
    for (let i = 0; i < movements.length; i++) {
        if (movements[i].time > time) {
            return i;
        }
    }
    return movements.length;
}

function getLoopStartTime(sound) {
    if (sound === 1) return loop1StartTime;
    else if (sound === 2) return loop2StartTime;
    else if (sound === 3) return loop3StartTime;
    else if (sound === 4) return loop4StartTime;
}

function getLoopDuration(sound) {
    if (sound === 1) return loop1Duration;
    else if (sound === 2) return loop2Duration;
    else if (sound === 3) return loop3Duration;
    else if (sound === 4) return loop4Duration;
}

function halveLoop(sound) {
    let loopDuration = getLoopDuration(sound);
    let halfDuration = loopDuration / 2;
    let currentTime = (millis() - loopStartTimes[sound]) % loopDuration;

    let movements = getMovementsArray(sound);

    // Determine which half of the loop we are in
    if (currentTime < halfDuration) {
        // We are in the first half, keep movements in the first half
        movements = movements.filter(mov => mov.time < halfDuration);
    } else {
        // We are in the second half, keep movements in the second half
        movements = movements.filter(mov => mov.time >= halfDuration);
        
        // Adjust times to fit within the new loop duration
        movements.forEach(mov => {
            mov.time -= halfDuration;
        });
    }

    // Update loop duration and movements
    setLoopDuration(sound, halfDuration);
    setMovementsArray(sound, movements);
}

function doubleLoop(sound) {
    let movements = getMovementsArray(sound);
    if (movements.length > 0) {
        let originalLength = movements.length;
        let originalDuration = getLoopDuration(sound);
        let newDuration = originalDuration * 2;
        console.log(`Doubling loop for sound ${sound}. Original length: ${originalLength}, Original duration: ${originalDuration}`);
        for (let i = 0; i < originalLength; i++) {
            let newMovement = { ...movements[i], time: movements[i].time + originalDuration };
            movements.push(newMovement); // Append the same values to double the array
        }
        console.log(`Loop for sound ${sound} doubled to ${movements.length} movements with new duration ${newDuration}`);
        setLoopDuration(sound, newDuration);
        startLoop(movements, sound); // Restart the loop with the new length
    } else {
        console.log(`No movements to double for sound ${sound}`);
    }
}

function setLoopDuration(sound, duration) {
    if (sound === 1) {
        loop1Duration = duration;
    } else if (sound === 2) {
        loop2Duration = duration;
    } else if (sound === 3) {
        loop3Duration = duration;
    } else if (sound === 4) {
        loop4Duration = duration;
    }
    console.log(`Set loop duration for sound ${sound} to ${duration}`);
}

function toggleLogging() {
    logging = !logging;
    if (logging) {
        console.log("Logging enabled");
    } else {
        console.log("Logging disabled");
    }
}

function saveMovementsToFile() {
    let movements = getMovementsArray(selectedSound);
    let logContent = movements.map(movement => `time: ${movement.time}, x: ${movement.x}, y: ${movement.y}, sound: ${movement.sound}`).join('\n');
    let blob = new Blob([logContent], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = `movements_log_sound_${selectedSound}_${Date.now()}.txt`; // Include timestamp in filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

window.addEventListener('DOMContentLoaded', (event) => {
    // Your code here
    window.selectSound = function(sound) {
        selectedSound = sound;
        let soundButtons = document.querySelectorAll('.sound-option');
        soundButtons.forEach((button, index) => {
            if (index + 1 === selectedSound) {
                button.classList.add('flash');
                setTimeout(() => button.classList.remove('flash'), 500); // Remove the class after the animation
            } else {
                button.style.backgroundColor = '';
            }
        });
    };
});

window.updateReverb = function(value) {
    reverb.drywet(parseFloat(value));  // Ensure value is treated as number
}

window.updateReverbSend = function(sound, value) {
    reverbDryWet[sound] = parseFloat(value);
    switch(sound) {
        case 1: reverb1.drywet(reverbDryWet[1]); break;
        case 2: reverb2.drywet(reverbDryWet[2]); break;
        case 3: reverb3.drywet(reverbDryWet[3]); break;
        case 4: reverb4.drywet(reverbDryWet[4]); break;
    }
}

// Update reverb time for all instances
window.updateReverbTime = function(value) {
    reverbTime = parseFloat(value);
    [reverb1, reverb2, reverb3, reverb4].forEach(rev => {
        rev.set(reverbTime, reverbDecay);
    });
}

// Update reverb decay for all instances
window.updateReverbDecay = function(value) {
    reverbDecay = parseFloat(value);
    [reverb1, reverb2, reverb3, reverb4].forEach(rev => {
        rev.set(reverbTime, reverbDecay);
    });
}

function iconExists(sound) {
    switch(sound) {
        case 1: return iconX1 !== null;
        case 2: return iconX2 !== null;
        case 3: return iconX3 !== null;
        case 4: return iconX4 !== null;
        default: return false;
    }
}

function recordOverdubMovement() {
    let loopDuration = getLoopDuration(selectedSound);
    let loopStartTime = loopStartTimes[selectedSound];
    let currentLoopPosition = (millis() - loopStartTime) % loopDuration;
    
    overdubMovements.push({
        time: currentLoopPosition,
        x: mouseX,
        y: mouseY,
        sound: selectedSound
    });
}

let loopStartTimes = {1: 0, 2: 0, 3: 0, 4: 0};
let overdubStartPosition = null;

function getCurrentLoopPosition(sound) {
    let loopDuration = getLoopDuration(sound);
    return (millis() - loopStartTimes[sound]) % loopDuration;
}

// Add loop cycle tracking
let loopCycles = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

// Add overdub validation
function canStartOverdub(sound) {
    let movements = getMovementsArray(sound);
    return movements && movements.length > 0;
}

// Add loop duration tracking
let loopDurations = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

// Add overdub state validation
function validateOverdubState() {
    if (!canStartOverdub(selectedSound)) {
        isOverdubbing = false;
        return false;
    }
    return true;
}

// State tracking
let overdubRange = {
    start: null,
    end: null,
    sound: null
};

// Movement management
let overdubBuffer = [];
let cleanupThreshold = 50; // ms window for cleanup

function startOverdub(sound, position) {
    overdubRange.start = position;
    overdubRange.sound = sound;
    overdubBuffer = [];
    removeExistingMovements(sound, position);
}

function removeExistingMovements(sound, startPosition) {
    let movements = getMovementsArray(sound);
    let loopDuration = getLoopDuration(sound);
    
    // Remove movements ahead of overdub position
    movements = movements.filter(mov => {
        let normalizedTime = mov.time % loopDuration;
        return normalizedTime < startPosition;
    });
    
    setMovementsArray(sound, movements);
}

function recordOverdubPosition() {
    if (!overdubState.isActive) return;
    
    let loopDuration = getLoopDuration(overdubState.sound);
    let currentPosition = (millis() - loopStartTimes[overdubState.sound]) % loopDuration;
    
    // Remove old movements first
    removeOverdubMovements(currentPosition);
    
    // Then add new position
    overdubState.buffer.push({
        time: currentPosition,
        x: mouseX,
        y: mouseY,
        sound: overdubState.sound
    });
}

function finalizeOverdub() {
    if (overdubBuffer.length === 0) return;
    
    let movements = getMovementsArray(overdubRange.sound);
    movements.push(...overdubBuffer);
    movements.sort((a, b) => a.time - b.time);
    
    setMovementsArray(overdubRange.sound, movements);
    
    // Reset state
    overdubRange = { start: null, end: null, sound: null };
    overdubBuffer = [];
}

let overdubState = {
    isActive: false,
    startTime: null,
    loopPosition: null,
    buffer: [],
    sound: null
};

function recordPosition(x, y) {
    let currentTime = millis();
    let loopDuration = getLoopDuration(overdubState.sound);
    let position = (currentTime - loopStartTimes[overdubState.sound]) % loopDuration;
    
    overdubState.buffer.push({
        time: position,
        x: x,
        y: y,
        sound: overdubState.sound
    });
}

function startOverdub() {
    overdubState.isActive = true;
    overdubState.startTime = millis();
    overdubState.sound = selectedSound;
    overdubState.buffer = [];
    let loopDuration = getLoopDuration(selectedSound);
    overdubState.loopPosition = (millis() - loopStartTimes[selectedSound]) % loopDuration;
}

function removeOverdubMovements(currentPosition) {
    if (!overdubState.isActive) return;
    
    let movements = getMovementsArray(overdubState.sound);
    let loopDuration = getLoopDuration(overdubState.sound);
    
    // Remove movements between start and current position
    movements = movements.filter(mov => {
        let normalizedTime = mov.time % loopDuration;
        return normalizedTime < overdubState.loopPosition || 
               normalizedTime > currentPosition;
    });
    
    setMovementsArray(overdubState.sound, movements);
}

function recordOverdubPosition() {
    if (!overdubState.isActive) return;
    
    let loopDuration = getLoopDuration(overdubState.sound);
    let currentPosition = (millis() - loopStartTimes[overdubState.sound]) % loopDuration;
    
    // Remove old movements first
    removeOverdubMovements(currentPosition);
    
    // Then add new position
    overdubState.buffer.push({
        time: currentPosition,
        x: mouseX,
        y: mouseY,
        sound: overdubState.sound
    });
}

function finalizeOverdub() {
    if (!overdubState.isActive || overdubState.buffer.length === 0) return;
    
    let movements = getMovementsArray(overdubState.sound);
    movements.push(...overdubState.buffer);
    movements.sort((a, b) => a.time - b.time);
    setMovementsArray(overdubState.sound, movements);
    
    // Clear state
    overdubState = {
        isActive: false,
        startTime: null,
        loopPosition: null,
        buffer: [],
        sound: null
    };
}

function endOverdub() {
    if (!overdubState.isActive) return;
    
    if (overdubState.buffer.length > 0) {
        let movements = getMovementsArray(overdubState.sound);
        movements.push(...overdubState.buffer);
        movements.sort((a, b) => a.time - b.time);
        setMovementsArray(overdubState.sound, movements);
    }
    
    // Reset state
    overdubState = {
        isActive: false,
        startTime: null,
        loopPosition: null,
        sound: null,
        buffer: []
    };
}

function toggleShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}
