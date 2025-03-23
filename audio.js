// audio.js
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

    [reverb1, reverb2, reverb3, reverb4].forEach((rev, i) => {
        rev.set(3, 2);
        rev.drywet(reverbDryWet[i + 1]);
    });

    osc1.disconnect();
    osc2.disconnect();
    osc3.disconnect();
    osc4.disconnect();

    reverb1.process(osc1);
    reverb2.process(osc2);
    reverb3.process(osc3);
    reverb4.process(osc4);
}

function updateSound(sound, x, y) {
    const startMessage = document.getElementById('startMessage');
    if (startMessage) startMessage.style.display = 'none';

    if (y === undefined || y === null) y = height;
    if (!height) return;

    let amp = map(y, height, 0, 0, 0.8);
    let minFreq = 40;
    let maxFreq = 1000;
    let freq = minFreq * Math.pow(maxFreq / minFreq, x / width);

    if (sound === 1) {
        osc1.freq(freq, freqTransitionTimes[1]);
        osc1.amp(amp, AMP_TRANSITION_TIME);
        iconX1 = x;
        iconY1 = y;
        freq1 = freq;
        amp1 = amp;

        // 👇 Start playing if it wasn’t yet
        if (!isPlaying1) {
            osc1.start();
            isPlaying1 = true;
        }

    } else if (sound === 2) {
        osc2.freq(freq, freqTransitionTimes[2]);
        osc2.amp(amp, AMP_TRANSITION_TIME);
        iconX2 = x;
        iconY2 = y;
        freq2 = freq;
        amp2 = amp;

        if (!isPlaying2) {
            osc2.start();
            isPlaying2 = true;
        }

    } else if (sound === 3) {
        osc3.freq(freq, freqTransitionTimes[3]);
        osc3.amp(amp, AMP_TRANSITION_TIME);
        iconX3 = x;
        iconY3 = y;
        freq3 = freq;
        amp3 = amp;

        if (!isPlaying3) {
            osc3.start();
            isPlaying3 = true;
        }

    } else if (sound === 4) {
        osc4.freq(freq, freqTransitionTimes[4]);
        osc4.amp(amp, AMP_TRANSITION_TIME);
        iconX4 = x;
        iconY4 = y;
        freq4 = freq;
        amp4 = amp;

        if (!isPlaying4) {
            osc4.start();
            isPlaying4 = true;
        }
    }
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