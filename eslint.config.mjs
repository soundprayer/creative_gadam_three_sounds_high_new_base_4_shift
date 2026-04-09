import js from '@eslint/js';
import globals from 'globals';

const p5Globals = {
    setup: 'readonly',
    draw: 'readonly',
    createCanvas: 'readonly',
    windowResized: 'readonly',
    windowWidth: 'readonly',
    resizeCanvas: 'readonly',
    background: 'readonly',
    width: 'readonly',
    height: 'readonly',
    millis: 'readonly',
    mouseX: 'readonly',
    mouseY: 'readonly',
    mouseIsPressed: 'readonly',
    mousePressed: 'readonly',
    mouseDragged: 'readonly',
    mouseReleased: 'readonly',
    keyPressed: 'readonly',
    keyReleased: 'readonly',
    key: 'readonly',
    keyCode: 'readonly',
    keyIsDown: 'readonly',
    frameCount: 'readonly',
    constrain: 'readonly',
    map: 'readonly',
    dist: 'readonly',
    random: 'readonly',
    stroke: 'readonly',
    strokeWeight: 'readonly',
    line: 'readonly',
    noStroke: 'readonly',
    fill: 'readonly',
    text: 'readonly',
    textAlign: 'readonly',
    CENTER: 'readonly',
    textSize: 'readonly',
    textFont: 'readonly',
    push: 'readonly',
    pop: 'readonly',
    rect: 'readonly',
    ellipse: 'readonly',
    triangle: 'readonly',
    redraw: 'readonly',
    sin: 'readonly',
    red: 'readonly',
    green: 'readonly',
    blue: 'readonly',
    color: 'readonly',
    getAudioContext: 'readonly',
    CONTROL: 'readonly',
    SHIFT: 'readonly',
    p5: 'readonly'
};

export default [
    { ignores: ['node_modules/**'] },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                ...globals.browser,
                ...p5Globals
            }
        },
        rules: {
            'no-redeclare': 'off',
            'no-undef': 'off',
            'no-unused-vars': 'off'
        }
    }
];
