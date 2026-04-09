// visual.js

function drawNoteLines() {
    const notes = getScaleNotes();
    stroke(255, 0, 0);
    strokeWeight(1);

    notes.forEach((note) => {
        const minFreq = 40;
        const maxFreq = 1000;
        const x = (width * Math.log(note.freq / minFreq)) / Math.log(maxFreq / minFreq);

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

function highlightSelectedSound() {
    const soundButtons = document.querySelectorAll('.sound-option');
    soundButtons.forEach((button, index) => {
        button.style.backgroundColor = index + 1 === selectedSound ? 'white' : '';
    });
}

function drawFrequencyText() {
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(64);
    textFont('Press Start 2P');

    const rows = [
        { slot: soundSlot(1), color: '--color-green', y: height / 2 - 120 },
        { slot: soundSlot(2), color: '--color-red', y: height / 2 - 40 },
        { slot: soundSlot(3), color: '--color-blue', y: height / 2 + 40 },
        { slot: soundSlot(4), color: '--color-yellow', y: height / 2 + 120 }
    ];

    rows.forEach(({ slot, color, y }) => {
        fill(getComputedStyle(document.documentElement).getPropertyValue(color).trim());
        text(Math.round(slot.freq) + ' Hz', width / 2, y);
    });
}

function drawParticleEffects() {
    const specs = [
        { id: 1, color: '--color-green' },
        { id: 2, color: '--color-red' },
        { id: 3, color: '--color-blue' },
        { id: 4, color: '--color-yellow' }
    ];

    specs.forEach(({ id, color }) => {
        const slot = soundSlot(id);
        if (slot.isPlaying && slot.amp > 0.1) {
            const particleSize = map(Math.log(slot.freq), Math.log(40), Math.log(1000), 20, 2);
            const cssColor = getComputedStyle(document.documentElement).getPropertyValue(color).trim();
            for (let i = 0; i < 100; i++) {
                const x = random(width);
                const y = random(height);
                const alpha = map(slot.amp, 0.1, 1, 0, 255);
                fill(colorFromCSS(cssColor, alpha));
                noStroke();
                rect(x, y, particleSize, particleSize);
            }
        }
    });
}

function colorFromCSS(cssColor, alpha = 255) {
    const col = color(cssColor);
    return color(red(col), green(col), blue(col), alpha);
}

function drawSoundIcons() {
    const icons = [
        { id: 1, shape: 'ellipse', color: '--color-green' },
        { id: 2, shape: 'triangle', color: '--color-red' },
        { id: 3, shape: 'rect', color: '--color-blue' },
        { id: 4, shape: 'ellipse', color: '--color-yellow' }
    ];

    icons.forEach(({ id, shape, color }) => {
        const slot = soundSlot(id);
        const x = slot.iconX;
        const y = slot.iconY;
        if (x !== null && y !== null) {
            fill(getComputedStyle(document.documentElement).getPropertyValue(color).trim());
            noStroke();
            if (shape === 'ellipse') ellipse(x, y, 20, 20);
            else if (shape === 'rect') rect(x - 10, y - 10, 20, 20);
            else if (shape === 'triangle') triangle(x - 10, y + 10, x + 10, y + 10, x, y - 10);
        }
    });
}

function updatePlayPauseStatus() {
    const playPauseStatus = document.getElementById('playPauseStatus');
    const anyPlaying = soundSlots.some((s) => s.isPlaying);
    playPauseStatus.textContent = anyPlaying ? 'Odpocząć' : 'Grać';
}
