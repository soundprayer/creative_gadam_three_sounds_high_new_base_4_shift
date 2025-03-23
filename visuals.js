// visual.js

// Draw vertical note lines and their labels
function drawNoteLines() {
    let notes = getScaleNotes();
    stroke(255, 0, 0);
    strokeWeight(1);

    notes.forEach(note => {
        let minFreq = 40;
        let maxFreq = 1000;
        let x = width * (Math.log(note.freq / minFreq)) / (Math.log(maxFreq / minFreq));

        if (x >= 0 && x <= width) {
            push();
            if (window.scaleChanged) {
                stroke(255, 0, 0, map(sin(frameCount * 0.1), -1, 1, 50, 200));
            }
            line(x, 0, x, height);
            pop();

            fill(255, 0, 0, 127);
            textSize(12);
            textAlign(CENTER);
            text(note.name, x, 20);
        }
    });

    if (window.scaleChanged && frameCount % 60 === 0) {
        window.scaleChanged = false;
    }
}

// Highlight selected sound button in UI
function highlightSelectedSound() {
    let soundButtons = document.querySelectorAll('.sound-option');
    soundButtons.forEach((button, index) => {
        button.style.backgroundColor = (index + 1 === selectedSound) ? 'white' : '';
    });
}

// Display frequency text for each sound
function drawFrequencyText() {
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(64);
    textFont('Press Start 2P');

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-green').trim());
    text(Math.round(freq1) + ' Hz', width / 2, height / 2 - 120);

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim());
    text(Math.round(freq2) + ' Hz', width / 2, height / 2 - 40);

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-blue').trim());
    text(Math.round(freq3) + ' Hz', width / 2, height / 2 + 40);

    fill(getComputedStyle(document.documentElement).getPropertyValue('--color-yellow').trim());
    text(Math.round(freq4) + ' Hz', width / 2, height / 2 + 120);
}

// Draw particle effects for active sounds
function drawParticleEffects() {
    const sounds = [
        { isPlaying: isPlaying1, amp: amp1, freq: freq1, color: '--color-green' },
        { isPlaying: isPlaying2, amp: amp2, freq: freq2, color: '--color-red' },
        { isPlaying: isPlaying3, amp: amp3, freq: freq3, color: '--color-blue' },
        { isPlaying: isPlaying4, amp: amp4, freq: freq4, color: '--color-yellow' },
    ];

    sounds.forEach(({ isPlaying, amp, freq, color }) => {
        if (isPlaying && amp > 0.1) {
            let particleSize = map(Math.log(freq), Math.log(40), Math.log(1000), 20, 2);
            let cssColor = getComputedStyle(document.documentElement).getPropertyValue(color).trim();
            for (let i = 0; i < 100; i++) {
                let x = random(width);
                let y = random(height);
                let alpha = map(amp, 0.1, 1, 0, 255);
                fill(colorFromCSS(cssColor, alpha));
                noStroke();
                rect(x, y, particleSize, particleSize);
            }
        }
    });
}

// Helper to get p5 color from CSS
function colorFromCSS(cssColor, alpha = 255) {
    const col = color(cssColor);
    return color(red(col), green(col), blue(col), alpha);
}

// Draw icons representing each sound
function drawSoundIcons() {
    const icons = [
        { x: iconX1, y: iconY1, shape: 'ellipse', color: '--color-green' },
        { x: iconX2, y: iconY2, shape: 'triangle', color: '--color-red' },
        { x: iconX3, y: iconY3, shape: 'rect', color: '--color-blue' },
        { x: iconX4, y: iconY4, shape: 'ellipse', color: '--color-yellow' },
    ];

    icons.forEach(({ x, y, shape, color }, index) => {
        if (x !== null && y !== null) {
            fill(getComputedStyle(document.documentElement).getPropertyValue(color).trim());
            noStroke();
            if (shape === 'ellipse') ellipse(x, y, 20, 20);
            else if (shape === 'rect') rect(x - 10, y - 10, 20, 20);
            else if (shape === 'triangle') triangle(x - 10, y + 10, x + 10, y + 10, x, y - 10);

            if (selectedSound === index + 1) {
                drawIconBorder(shape, x, y);
            }
        }
    });
}

// Helper function to draw border around icon
function drawIconBorder(shape, x, y) {
    stroke(255);
    strokeWeight(4);
    noFill();
    if (shape === 'ellipse') ellipse(x, y, 30, 30);
    else if (shape === 'rect') rect(x - 10, y - 10, 20, 20);
    else if (shape === 'triangle') triangle(x - 10, y + 10, x + 10, y + 10, x, y - 10);
}

// Update play/pause button text
function updatePlayPauseStatus() {
    let playPauseStatus = document.getElementById('playPauseStatus');
    playPauseStatus.textContent = (isPlaying1 || isPlaying2 || isPlaying3 || isPlaying4) ? 'Odpocząć' : 'Grać';
}
