function setupOscillators() {
    osc1 = new p5.Oscillator('sine');
    osc2 = new p5.Oscillator('triangle');
    osc3 = new p5.Oscillator('square');
    osc4 = new p5.Oscillator('sawtooth');
}

function setupReverb() {
    reverb1 = new p5.Reverb();
    reverb2 = new p5.Reverb();
    reverb3 = new p5.Reverb();
    reverb4 = new p5.Reverb();

    const oscillators = [osc1, osc2, osc3, osc4];
    const reverbs = [reverb1, reverb2, reverb3, reverb4];

    // Configure each reverb and connect it to its oscillator
    reverbs.forEach((reverb, index) => {
        const soundId = index + 1;

        reverb.set(3, 2); // default time & decay
        reverb.drywet(reverbDryWet[soundId]);

        oscillators[index].disconnect();
        reverb.process(oscillators[index]);
    });
}

function updateSound(soundId, x, y) {
    const margin = 5;
    const startMessage = document.getElementById('startMessage');
    if (startMessage) startMessage.style.display = 'none';

    if (!height) return;
    if (y === undefined || y === null) y = height;

    x = constrain(x, margin, width - margin);
    y = constrain(y, margin, height - margin);

    const amp = map(y, height, 0, 0, 0.8);
    const minFreq = 40;
    const maxFreq = 1000;
    const freq = minFreq * Math.pow(maxFreq / minFreq, x / width);

    const oscMap = {
        1: osc1,
        2: osc2,
        3: osc3,
        4: osc4
    };

    const playingMap = {
        1: () => { if (!isPlaying1) { osc1.start(); isPlaying1 = true; } },
        2: () => { if (!isPlaying2) { osc2.start(); isPlaying2 = true; } },
        3: () => { if (!isPlaying3) { osc3.start(); isPlaying3 = true; } },
        4: () => { if (!isPlaying4) { osc4.start(); isPlaying4 = true; } }
    };

    oscMap[soundId].freq(freq, freqTransitionTimes[soundId]);
    oscMap[soundId].amp(amp, AMP_TRANSITION_TIME);

    // Explicitly update global variables
    if (soundId === 1) {
        iconX1 = x; iconY1 = y; freq1 = freq; amp1 = amp;
    } else if (soundId === 2) {
        iconX2 = x; iconY2 = y; freq2 = freq; amp2 = amp;
    } else if (soundId === 3) {
        iconX3 = x; iconY3 = y; freq3 = freq; amp3 = amp;
    } else if (soundId === 4) {
        iconX4 = x; iconY4 = y; freq4 = freq; amp4 = amp;
    }

    playingMap[soundId]();
}

// Keep all window.* reverb update functions
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