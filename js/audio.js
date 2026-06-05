function initAudio() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        const sound = getSound(i);
        sound.osc = new p5.Oscillator(OSC_TYPES[i]);
        sound.reverb = new p5.Reverb();
        sound.reverb.set(reverbTime, reverbDecay);
        sound.reverb.drywet(reverbDryWet[i]);
        sound.osc.disconnect();
        sound.reverb.process(sound.osc);
    }

    getAudioContext().resume().then(() => {
        setupComplete = true;
    });
}

function updateSound(soundId, x, y) {
    if (y === undefined || y === null) {
        y = height;
    }
    if (!height) return;

    const sound = getSound(soundId);
    const amp = map(y, height, 0, 0, 0.8);
    const freq = xToFreq(x);

    sound.osc.freq(freq, freqTransitionTimes[soundId]);
    sound.osc.amp(amp, AMP_TRANSITION_TIME);
    sound.iconX = x;
    sound.iconY = y;
    sound.freq = freq;
    sound.amp = amp;
}

function startSoundOscillator(soundId) {
    const sound = getSound(soundId);
    sound.osc.start();
    sound.isPlaying = true;
}

function stopAllOscillators() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        const sound = getSound(i);
        if (sound.isPlaying) {
            sound.osc.stop();
            sound.isPlaying = false;
        }
    }
}

function startActiveOscillators() {
    for (let i = 1; i <= SOUND_COUNT; i++) {
        const sound = getSound(i);
        if (sound.iconX !== null) {
            startSoundOscillator(i);
        }
    }
}

function updateTransitionTime(sound, value) {
    transitionTimes[sound] = parseFloat(value);
}

function updateFreqTransitionTime(sound, value) {
    freqTransitionTimes[sound] = parseFloat(value);
}

window.updateFreqTransitionTime = updateFreqTransitionTime;

window.updateReverbSend = function(sound, value) {
    reverbDryWet[sound] = parseFloat(value);
    getSound(sound).reverb.drywet(reverbDryWet[sound]);
};

window.updateReverbTime = function(value) {
    reverbTime = parseFloat(value);
    for (let i = 1; i <= SOUND_COUNT; i++) {
        getSound(i).reverb.set(reverbTime, reverbDecay);
    }
};

window.updateReverbDecay = function(value) {
    reverbDecay = parseFloat(value);
    for (let i = 1; i <= SOUND_COUNT; i++) {
        getSound(i).reverb.set(reverbTime, reverbDecay);
    }
};

window.updateReverb = function(value) {
    console.warn('updateReverb is deprecated; use updateReverbSend instead.');
};
