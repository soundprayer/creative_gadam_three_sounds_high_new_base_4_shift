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
let reverb = 5;
let reverbTime = 3; // Initialize reverb time
let reverbDecay = 2;   // Initialize reverb decay
let recording = false;
let overdubbing = false; // Flag to track overdubbing state
let recordStartTime;
let movements1 = [], movements2 = [], movements3 = [], movements4 = [];
let loopInterval1, loopInterval2, loopInterval3, loopInterval4;
let isDragging = false;
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

let overdubStartTime = 0;
let overdubEndTime = 0;
let overdubMovements = [];

let loggingEnabled = false;

function setup() {
    createCanvas(windowWidth, 400);
    noSmooth(); // Disable anti-aliasing for a pixelated look

    osc1 = new p5.Oscillator('sine');
    osc2 = new p5.Oscillator('triangle');
    osc3 = new p5.Oscillator('square');
    osc4 = new p5.Oscillator('sawtooth');
    
    // Create reverb effect
    reverb = new p5.Reverb();
    
    // Set initial parameters
    reverb.set(reverbTime, reverbDecay);
    
    // Initialize reverb dry/wet to match the slider value
    let reverbSlider = document.getElementById('reverbSlider');
    reverb.drywet(reverbSlider.value / 100);

    // Disconnect oscillators from master output
    osc1.disconnect();
    osc2.disconnect();
    osc3.disconnect();
    osc4.disconnect();
    
    // Process oscillators with reverb
    reverb.process(osc1);
    reverb.process(osc2);
    reverb.process(osc3);
    reverb.process(osc4);

    // Initialize oscillator amplitudes
    osc1.amp(0);
    osc2.amp(0);
    osc3.amp(0);
    osc4.amp(0);

    // Show start message
    let startMessage = document.getElementById('startMessage');
    startMessage.style.display = 'block';

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            // Resume audio context
            if (getAudioContext().state !== 'running') {
                getAudioContext().resume();
                console.log('Audio context resumed');
            }
            // Restart the draw loop
            loop();
        } else {
            // Optionally pause the draw loop to save resources
            noLoop();
        }
    });
}

function windowResized() {
    resizeCanvas(windowWidth, 400);
}

function draw() {
    background(0);

    // Highlight the selected sound in the menu
    let soundButtons = document.querySelectorAll('.sound-option');
    soundButtons.forEach((button, index) => {
        if (index + 1 === selectedSound) {
            button.style.backgroundColor = 'white';
        } else {
            button.style.backgroundColor = '';
        }
    });

    if (isPlaying1) {
        if (mouseIsPressed && selectedSound === 1 && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            updateSound(1, mouseX, mouseY);
            if (recording) {
                movements1.push({ time: millis() - recordStartTime, x: mouseX, y: mouseY, sound: 1 });
            }
        }
    }

    if (isPlaying2) {
        if (mouseIsPressed && selectedSound === 2 && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            updateSound(2, mouseX, mouseY);
            if (recording) {
                movements2.push({ time: millis() - recordStartTime, x: mouseX, y: mouseY, sound: 2 });
            }
        }
    }

    if (isPlaying3) {
        if (mouseIsPressed && selectedSound === 3 && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            updateSound(3, mouseX, mouseY);
            if (recording) {
                movements3.push({ time: millis() - recordStartTime, x: mouseX, y: mouseY, sound: 3 });
            }
        }
    }

    if (isPlaying4) {
        if (mouseIsPressed && selectedSound === 4 && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
            updateSound(4, mouseX, mouseY);
            if (recording) {
                movements4.push({ time: millis() - recordStartTime, x: mouseX, y: mouseY, sound: 4 });
            }
        }
    }

    // Reset drawing styles before drawing text
    noStroke();
    fill(0, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(64);
    textFont('Press Start 2P');
    text(freq1.toFixed(2) + ' Hz', width / 2, height / 2 - 120);

    fill(255, 0, 0);
    text(freq2.toFixed(2) + ' Hz', width / 2, height / 2 - 40);

    fill(0, 0, 255);
    text(freq3.toFixed(2) + ' Hz', width / 2, height / 2 + 40);

    fill(255, 255, 0);
    text(freq4.toFixed(2) + ' Hz', width / 2, height / 2 + 120);

    if (isPlaying1 && amp1 > 0.1) {
        let particleSize1 = map(freq1, 100, 1000, 20, 2);
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha1 = map(amp1, 0.1, 1, 0, 255);
            fill(0, 255, 0, alpha1);
            noStroke();
            rect(x, y, particleSize1, particleSize1);
        }
    }

    if (isPlaying2 && amp2 > 0.1) {
        let particleSize2 = map(freq2, 100, 1000, 20, 2);
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha2 = map(amp2, 0.1, 1, 0, 255);
            fill(255, 0, 0, alpha2);
            noStroke();
            rect(x, y, particleSize2, particleSize2);
        }
    }

    if (isPlaying3 && amp3 > 0.1) {
        let particleSize3 = map(freq3, 100, 1000, 20, 2);
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha3 = map(amp3, 0.1, 1, 0, 255);
            fill(0, 0, 255, alpha3);
            noStroke();
            rect(x, y, particleSize3, particleSize3);
        }
    }

    if (isPlaying4 && amp4 > 0.1) {
        let particleSize4 = map(freq4, 100, 1000, 20, 2);
        for (let i = 0; i < 100; i++) {
            let x = random(width);
            let y = random(height);
            let alpha4 = map(amp4, 0.1, 1, 0, 255);
            fill(255, 255, 0, alpha4);
            noStroke();
            rect(x, y, particleSize4, particleSize4);
        }
    }

    if (iconX1 !== null && iconY1 !== null) {
        fill(0, 255, 0);
        noStroke();
        ellipse(iconX1, iconY1, 20, 20); // Draw a retro icon for the first sound
    }

    if (iconX2 !== null && iconY2 !== null) {
        fill(255, 0, 0);
        noStroke();
        triangle(iconX2 - 10, iconY2 + 10, iconX2 + 10, iconY2 + 10, iconX2, iconY2 - 10); // Draw a retro icon for the second sound
    }

    if (iconX3 !== null && iconY3 !== null) {
        fill(0, 0, 255);
        noStroke();
        rect(iconX3 - 10, iconY3 - 10, 20, 20); // Draw a retro icon for the third sound
    }

    if (iconX4 !== null && iconY4 !== null) {
        fill(255, 255, 0);
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
        playPauseStatus.textContent = 'Pause';
    } else {
        playPauseStatus.textContent = 'Play';
    }

    // Update loops
    updateLoop1();
    updateLoop2();
    updateLoop3();
    updateLoop4();
}

// Function to draw a hexagon
function drawHexagon(x, y, radius) {
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += TWO_PI / 6) {
        let sx = x + cos(angle) * radius;
        let sy = y + sin(angle) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function updateSound(sound, x, y) {
    let freq = map(x, 0, width, 40, 1000); // Adjusted frequency range to 40 Hz to 1 kHz
    let amp = map(y, height, 0, 0, 0.8); // Limited amplitude to 0.8
    if (sound === 1) {
        osc1.freq(freq);
        osc1.amp(amp, 0.1);
        osc1.phase(0); // Reset phase
        iconX1 = x;
        iconY1 = y;
        freq1 = freq; // Update global frequency variable for visualization
        amp1 = amp; // Update global amplitude variable for visualization
    } else if (sound === 2) {
        osc2.freq(freq);
        osc2.amp(amp, 0.1);
        osc2.phase(0); // Reset phase
        iconX2 = x;
        iconY2 = y;
        freq2 = freq; // Update global frequency variable for visualization
        amp2 = amp; // Update global amplitude variable for visualization
    } else if (sound === 3) {
        osc3.freq(freq);
        osc3.amp(amp, 0.1);
        osc3.phase(0); // Reset phase
        iconX3 = x;
        iconY3 = y;
        freq3 = freq; // Update global frequency variable for visualization
        amp3 = amp; // Update global amplitude variable for visualization
    } else if (sound === 4) {
        osc4.freq(freq);
        osc4.amp(amp, 0.1);
        osc4.phase(0); // Reset phase
        iconX4 = x;
        iconY4 = y;
        freq4 = freq; // Update global frequency variable for visualization
        amp4 = amp; // Update global amplitude variable for visualization
    }
}

function togglePlay() {
    let playPauseStatus = document.getElementById('playPauseStatus');
    if (isPlaying1 || isPlaying2 || isPlaying3 || isPlaying4) {
        osc1.stop();
        osc2.stop();
        osc3.stop();
        osc4.stop();
        isPlaying1 = false;
        isPlaying2 = false;
        isPlaying3 = false;
        isPlaying4 = false;
        playPauseStatus.textContent = 'Play';
    } else {
        osc1.start();
        osc2.start();
        osc3.start();
        osc4.start();
        isPlaying1 = true;
        isPlaying2 = true;
        isPlaying3 = true;
        isPlaying4 = true;
        playPauseStatus.textContent = 'Pause';
    }
}

function mousePressed() {
    if (!started) {
        getAudioContext().resume();
        started = true;
        let startMessage = document.getElementById('startMessage');
        startMessage.style.display = 'none';
    }
    
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // Check if clicking on any existing icon
        let clickedOnIcon = false;
        if (iconX1 !== null && iconY1 !== null && dist(mouseX, mouseY, iconX1, iconY1) < 20) {
            selectedSound = 1;
            clickedOnIcon = true;
            isDragging1 = true;
        } else if (iconX2 !== null && iconY2 !== null && dist(mouseX, mouseY, iconX2, iconY2) < 20) {
            selectedSound = 2;
            clickedOnIcon = true;
            isDragging2 = true;
        } else if (iconX3 !== null && iconY3 !== null && dist(mouseX, mouseY, iconX3, iconY3) < 20) {
            selectedSound = 3;
            clickedOnIcon = true;
            isDragging3 = true;
        } else if (iconX4 !== null && iconY4 !== null && dist(mouseX, mouseY, iconX4, iconY4) < 20) {
            selectedSound = 4;
            clickedOnIcon = true;
            isDragging4 = true;
        } else {
            // Not clicking on any icon
            if (recording && overdubbing) {
                // Record the click position during overdubbing
                overdubMovements.push({
                    time: millis(),
                    x: mouseX,
                    y: mouseY,
                    sound: selectedSound
                });
                console.log("Overdub click recorded at", mouseX, mouseY);
            } else if (recording && !overdubbing) {
                // Record the click position during initial recording
                let movements = getMovementsArray(selectedSound);
                movements.push({
                    time: millis() - recordStartTime,
                    x: mouseX,
                    y: mouseY,
                    sound: selectedSound
                });
                console.log("Recording click at", mouseX, mouseY);
            } else {
                // Start playing the selected sound if not already playing
                if (selectedSound === 1 && !isPlaying1) {
                    osc1.start();
                    isPlaying1 = true;
                } else if (selectedSound === 2 && !isPlaying2) {
                    osc2.start();
                    isPlaying2 = true;
                } else if (selectedSound === 3 && !isPlaying3) {
                    osc3.start();
                    isPlaying3 = true;
                } else if (selectedSound === 4 && !isPlaying4) {
                    osc4.start();
                    isPlaying4 = true;
                }
            }
        }
    }
}

function mouseDragged() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        if (isPlaying1 && selectedSound === 1) {
            isDragging1 = true;
            updateSound(1, mouseX, mouseY);
            if (recording) {
                console.log(`Dragging and recording movement for sound 1 at (${mouseX}, ${mouseY})`);
                let currentTime = millis() - recordStartTime;
                if (overdubbing) {
                    let loopStartTime = getLoopStartTime(1);
                    let loopElapsedTime = (millis() - loopStartTime) % getLoopDuration(1);
                    let index = findInsertIndex(movements1, loopElapsedTime);
                    movements1.splice(index, 1, { time: loopElapsedTime, x: mouseX, y: mouseY, sound: 1 });
                } else {
                    movements1.push({ time: currentTime, x: mouseX, y: mouseY, sound: 1 });
                }
            }
        }
        if (isPlaying2 && selectedSound === 2) {
            isDragging2 = true;
            updateSound(2, mouseX, mouseY);
            if (recording) {
                console.log(`Dragging and recording movement for sound 2 at (${mouseX}, ${mouseY})`);
                let currentTime = millis() - recordStartTime;
                if (overdubbing) {
                    let loopStartTime = getLoopStartTime(2);
                    let loopElapsedTime = (millis() - loopStartTime) % getLoopDuration(2);
                    let index = findInsertIndex(movements2, loopElapsedTime);
                    movements2.splice(index, 1, { time: loopElapsedTime, x: mouseX, y: mouseY, sound: 2 });
                } else {
                    movements2.push({ time: currentTime, x: mouseX, y: mouseY, sound: 2 });
                }
            }
        }
        if (isPlaying3 && selectedSound === 3) {
            isDragging3 = true;
            updateSound(3, mouseX, mouseY);
            if (recording) {
                console.log(`Dragging and recording movement for sound 3 at (${mouseX}, ${mouseY})`);
                let currentTime = millis() - recordStartTime;
                if (overdubbing) {
                    let loopStartTime = getLoopStartTime(3);
                    let loopElapsedTime = (millis() - loopStartTime) % getLoopDuration(3);
                    let index = findInsertIndex(movements3, loopElapsedTime);
                    movements3.splice(index, 1, { time: loopElapsedTime, x: mouseX, y: mouseY, sound: 3 });
                } else {
                    movements3.push({ time: currentTime, x: mouseX, y: mouseY, sound: 3 });
                }
            }
        }
        if (isPlaying4 && selectedSound === 4) {
            isDragging4 = true;
            updateSound(4, mouseX, mouseY);
            if (recording) {
                console.log(`Dragging and recording movement for sound 4 at (${mouseX}, ${mouseY})`);
                let currentTime = millis() - recordStartTime;
                if (overdubbing) {
                    let loopStartTime = getLoopStartTime(4);
                    let loopElapsedTime = (millis() - loopStartTime) % getLoopDuration(4);
                    let index = findInsertIndex(movements4, loopElapsedTime);
                    movements4.splice(index, 1, { time: loopElapsedTime, x: mouseX, y: mouseY, sound: 4 });
                } else {
                    movements4.push({ time: currentTime, x: mouseX, y: mouseY, sound: 4 });
                }
            }
        }
    }
    if (recording && overdubbing) {
        let currentTime = millis();
        let movement = {
            time: currentTime,
            x: mouseX,
            y: mouseY,
            sound: selectedSound
        };
        overdubMovements.push(movement);
        updateSound(selectedSound, mouseX, mouseY);
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
    if (!started) {
        getAudioContext().resume();
        started = true;
        let startMessage = document.getElementById('startMessage');
        if (startMessage) {
            startMessage.style.display = 'none';
        }
    }

    if (key === ' ') { // Check if the space key is pressed
        togglePlay();
    } else if (keyCode === SHIFT) { // Check if the 'Shift' key is pressed
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
        loopIndicator.textContent = 'Loop: RECORDING';
    } else if (keyCode === ALT) { // Check if the 'Alt' key is pressed
        let loopIndicator = document.getElementById('loopIndicator');
        // Start overdubbing
        recording = true;
        overdubbing = true;
        overdubStartTime = millis();
        overdubMovements = []; // Initialize the overdub movements array
        loopIndicator.textContent = 'Loop: OVERDUBBING';
    } else if (key === 'L' || key === 'l') { // Check if the 'L' key is pressed
        loggingEnabled = !loggingEnabled; // Toggle logging state
        console.log(`File logging ${loggingEnabled ? 'enabled' : 'disabled'}`);
    } else if (key === 'Z' || key === 'z') { // Check if the 'Z' key is pressed
        halveLoop(selectedSound); // Lasso effect halve
    } else if (key === 'X' || key === 'x') { // Check if the 'X' key is pressed
        doubleLoop(selectedSound); // Lasso effect double
    } else if (key === 'S' || key === 's') { // Check if the 'S' key is pressed
        shrinkLoop(selectedSound); // Shrink loop
    } else if (key === 'D' || key === 'd') { // Check if the 'D' key is pressed
        doubleLoopArray(selectedSound); // Double loop array
    } else if (key === 'Q' || key === 'q') { // Check if the 'Q' key is pressed
        toggleSelectedSound();
    }
}

function toggleSelectedSound() {
    selectedSound = (selectedSound % 4) + 1; // Cycle through sounds 1 to 4
}

function keyReleased() {
    if (keyCode === SHIFT) { // When recording stops
        recording = false;
        let loopIndicator = document.getElementById('loopIndicator');
        loopIndicator.textContent = 'Loop: ON';
        console.log("Recording stopped, starting loop");

        if (selectedSound === 1) {
            movements1.push({ time: millis() - recordStartTime, x: iconX1, y: iconY1, sound: 1 });
            console.log("Final movement for sound 1 recorded at", movements1[movements1.length - 1]);
            startLoop(movements1, 1);
            if (loggingEnabled) saveMovementsLog(1); // Save log file for sound 1 if logging is enabled
        } else if (selectedSound === 2) {
            movements2.push({ time: millis() - recordStartTime, x: iconX2, y: iconY2, sound: 2 });
            console.log("Final movement for sound 2 recorded at", movements2[movements2.length - 1]);
            startLoop(movements2, 2);
            if (loggingEnabled) saveMovementsLog(2); // Save log file for sound 2 if logging is enabled
        } else if (selectedSound === 3) {
            movements3.push({ time: millis() - recordStartTime, x: iconX3, y: iconY3, sound: 3 });
            console.log("Final movement for sound 3 recorded at", movements3[movements3.length - 1]);
            startLoop(movements3, 3);
            if (loggingEnabled) saveMovementsLog(3); // Save log file for sound 3 if logging is enabled
        } else if (selectedSound === 4) {
            movements4.push({ time: millis() - recordStartTime, x: iconX4, y: iconY4, sound: 4 });
            console.log("Final movement for sound 4 recorded at", movements4[movements4.length - 1]);
            startLoop(movements4, 4);
            if (loggingEnabled) saveMovementsLog(4); // Save log file for sound 4 if logging is enabled
        }
    } else if (keyCode === ALT) { // When overdubbing stops
        recording = false;
        overdubbing = false;
        overdubEndTime = millis();
        let loopIndicator = document.getElementById('loopIndicator');
        loopIndicator.textContent = 'Loop: ON';

        // ... overdubbing logic ...

        // Save log file for the selected sound after overdubbing if logging is enabled
        if (loggingEnabled) saveMovementsLog(selectedSound);

        // Clear overdubMovements
        overdubMovements = [];
    }
}

function setMovementsArray(sound, movements) {
    if (sound === 1) {
        movements1 = movements;
    } else if (sound === 2) {
        movements2 = movements;
    } else if (sound === 3) {
        movements3 = movements;
    } else if (sound === 4) {
        movements4 = movements;
    }
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

    while (
        loop1CurrentIndex < movements1.length &&
        movements1[loop1CurrentIndex].time <= elapsedTime
    ) {
        let movement = movements1[loop1CurrentIndex];
        updateSound(1, movement.x, movement.y);
        loop1CurrentIndex++;
    }

    if (elapsedTime >= loop1Duration) {
        loop1StartTime += loop1Duration;
        loop1CurrentIndex = 0;
    }
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
    console.log("Loop 2 updated, elapsedTime:", elapsedTime, "loop2Duration:", loop2Duration);
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
    console.log("Loop 3 updated, elapsedTime:", elapsedTime, "loop3Duration:", loop3Duration);
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
    console.log("Loop 4 updated, elapsedTime:", elapsedTime, "loop4Duration:", loop4Duration);
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
    setLoopDuration(sound, loopDuration / 2);
    console.log(`Loop ${sound} duration halved to ${loopDuration / 2} ms`);
}

function doubleLoop(sound) {
    let loopDuration = getLoopDuration(sound);
    setLoopDuration(sound, loopDuration * 2);
    console.log(`Loop ${sound} duration doubled to ${loopDuration * 2} ms`);
}

function shrinkLoop(sound) {
    let loopDuration = getLoopDuration(sound);
    let loopStartTime = getLoopStartTime(sound);
    let elapsedTime = (millis() - loopStartTime) % loopDuration;

    let movements = getMovementsArray(sound);
    let newMovements = [];

    if (elapsedTime >= loopDuration / 2) {
        // Keep the second half of the loop
        newMovements = movements.filter(movement => movement.time >= loopDuration / 2);
        newMovements.forEach(movement => movement.time -= loopDuration / 2);
        console.log(`Loop ${sound} shrunk to second half, new duration: ${loopDuration / 2} ms`);
    } else {
        // Keep the first half of the loop
        newMovements = movements.filter(movement => movement.time < loopDuration / 2);
        console.log(`Loop ${sound} shrunk to first half, new duration: ${loopDuration / 2} ms`);
    }

    setMovementsArray(sound, newMovements);
    setLoopDuration(sound, loopDuration / 2);
}

function doubleLoopArray(sound) {
    let movements = getMovementsArray(sound);
    let loopDuration = getLoopDuration(sound);
    let doubledMovements = movements.concat(movements.map(movement => ({
        ...movement,
        time: movement.time + loopDuration
    })));

    setMovementsArray(sound, doubledMovements);
    setLoopDuration(sound, loopDuration * 2);
    console.log(`Loop ${sound} array doubled, new duration: ${loopDuration * 2} ms`);
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

function formatMovements(movements) {
    return movements.map(movement => {
        return `time: ${movement.time}, x: ${movement.x}, y: ${movement.y}, sound: ${movement.sound}`;
    });
}

function saveMovementsLog(sound) {
    let movements = getMovementsArray(sound);
    let formattedMovements = formatMovements(movements);
    saveStrings(formattedMovements, `movements_log_sound_${sound}.txt`);
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
    console.log("Reverb value:", value); // Debugging log
    reverb.drywet(value);
    console.log("Reverb drywet set to:", reverb.drywet()); // Verify the value
}

window.updateReverbTime = function(value) {
    console.log("Reverb time value:", value); // Debugging log
    reverbTime = value; // Update the global variable
    reverb.set(reverbTime, reverbDecay); // Apply the new reverb time
}

window.updateReverbDecay = function(value) {
    console.log("Reverb decay value:", value); // Debugging log
    reverbDecay = value; // Update the global variable
    reverb.set(reverbTime, reverbDecay); // Apply the new reverb decay
}