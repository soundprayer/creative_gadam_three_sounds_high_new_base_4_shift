function setup() {
    createCanvas(windowWidth, CANVAS_HEIGHT);
    initAudio();
}

function draw() {
    renderFrame();
}

function windowResized() {
    resizeCanvas(windowWidth, CANVAS_HEIGHT);
}
