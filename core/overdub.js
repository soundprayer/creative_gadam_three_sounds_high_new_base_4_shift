function setOverdubIndicator(visible) {
    const el = document.getElementById('overdubIndicator');
    if (el) el.style.display = visible ? 'block' : 'none';
}

function startOverdub() {
    const slot = soundSlot(selectedSound);
    if (!slot.isLoopActive) {
        if (debugMode) console.warn('Overdub: brak aktywnej rutyny dla tego aspektu.');
        return;
    }

    overdubSound = selectedSound;
    const elapsed = millis() - slot.loopStartTime;
    const dur = slot.loopDuration;
    overdubPhaseStart = dur > 0 ? elapsed % dur : 0;
    overdubAnchorTime = millis();
    overdubMovements = [];
    isOverdubbing = true;
    stopLoop(overdubSound);
    setOverdubIndicator(true);
}

function finalizeOverdub() {
    if (!isOverdubbing) return;

    isOverdubbing = false;
    setOverdubIndicator(false);

    const sound = overdubSound;
    const slot = soundSlot(sound);
    const loopDur = slot.loopDuration;
    const movements = slot.movements.slice();
    const T0 = overdubPhaseStart;
    const dT = millis() - overdubAnchorTime;
    const T1 = Math.min(T0 + dT, loopDur);

    if (overdubMovements.length === 0) {
        startLoop(movements, sound);
        return;
    }

    const before = movements.filter((m) => m.time < T0);
    const middle = overdubMovements
        .map((m) => ({
            time: T0 + m.relMs,
            x: m.x,
            y: m.y,
            sound: sound
        }))
        .filter((m) => m.time <= T1);
    const after = movements.filter((m) => m.time > T1);

    const merged = before.concat(middle, after).sort((a, b) => a.time - b.time);

    const cleaned = [];
    for (let i = 0; i < merged.length; i++) {
        const m = merged[i];
        if (cleaned.length && m.time <= cleaned[cleaned.length - 1].time) {
            cleaned[cleaned.length - 1] = m;
        } else {
            cleaned.push(m);
        }
    }

    if (!cleaned.length) {
        startLoop(movements, sound);
        return;
    }

    const newDur = cleaned[cleaned.length - 1].time;
    slot.movements = cleaned;
    slot.loopDuration = newDur;
    startLoop(cleaned, sound);
}
