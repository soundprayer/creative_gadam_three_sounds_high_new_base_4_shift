function setupOscillators() {
    const types = ['sine', 'triangle', 'square', 'sawtooth'];
    oscillators = types.map((t) => new p5.Oscillator(t));
}

function setupReverb() {
    reverbs = [new p5.Reverb(), new p5.Reverb(), new p5.Reverb(), new p5.Reverb()];

    reverbs.forEach((reverb, index) => {
        reverb.set(reverbTime, reverbDecay);
        reverb.drywet(reverbDryWet[index]);

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

    const idx = soundId - 1;
    const osc = oscillators[idx];
    const slot = soundSlots[idx];

    osc.freq(freq, freqTransitionTimes[idx]);
    osc.amp(amp, AMP_TRANSITION_TIME);

    slot.iconX = x;
    slot.iconY = y;
    slot.freq = freq;
    slot.amp = amp;

    if (!slot.isPlaying) {
        osc.start();
        slot.isPlaying = true;
    }
}

function updateReverbSend(sound, value) {
    const idx = sound - 1;
    reverbDryWet[idx] = parseFloat(value);
    reverbs[idx].drywet(reverbDryWet[idx]);
}

function updateReverbTime(value) {
    reverbTime = parseFloat(value);
    reverbs.forEach((rev) => {
        rev.set(reverbTime, reverbDecay);
    });
}

function updateReverbDecay(value) {
    reverbDecay = parseFloat(value);
    reverbs.forEach((rev) => {
        rev.set(reverbTime, reverbDecay);
    });
}
