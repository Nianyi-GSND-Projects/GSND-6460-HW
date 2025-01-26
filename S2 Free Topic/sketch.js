// Fields

const colors = ['black', 'white'];
let [fg, bg] = colors;  // Kind of like a double-buffering, used to swap the colors.
let queue = [];  // Queued characters tp draw in the future.
let c;  // The character being drawn.
let font = document.getElementById('font-input').value;

// Anim states

const baseScale = 100;  // The "actual" font size used to draw the texts.
const switchLimit = 100;  // Switch to next character at which frame?
const scalingSpeed = 0.15;  // How fast does the character grow?
let frameCount = 0;  // The current frame position, ranged in [0, switchLimit).
const rotationSpeedCap = 10;  // The maximum rotating speed.
let rotationSpeed = 0;  // The rotating speed.
let rotationDegree = 0;  // The rotated angle in degree.

// p5.js life cycle

function setup() {
	createCanvas(400, 400);
	textStyle(BOLD);
}

function draw() {
	resetMatrix();
	translate(width / 2, height / 2);

	background(bg);

	if(c)
		DrawCharacter();
}

// Internal functions

function DrawCharacter() {
	scale(Math.exp(scalingSpeed * frameCount) / baseScale);
	rotate(rotationDegree);
	fill(fg);
	textFont(font, baseScale);
	textAlign(CENTER, CENTER);
	text(c, 0, 0);

	++frameCount;
	rotationDegree += rotationSpeed / getTargetFrameRate();

	if(frameCount >= switchLimit) {
		StartNewCharacter();
	}
}

function StartNewCharacter() {
	c = queue.shift();
	frameCount = 0;

	// Update the colors.
	// Get the pixel color in the middle and use it as the criteria to change the fg/bg colors.
	const pixel = get(width / 2, height / 2);
	[fg, bg] = [0, 1].map(i => colors[1 ^ i ^ +(pixel[0] > 128)]);

	// Rotation.
	rotationDegree = 0;
	rotationSpeed = (Math.random() * 2 - 1) * rotationSpeedCap;
}

// HTML-side related functions

const $textInput = document.getElementById('text-input');

function Go() {
	const inputText = $textInput.value;
	queue = Array.from(inputText);
	StartNewCharacter();
}

document.addEventListener('click', e => {
	if(e.target.classList.contains('text-preset')) {
		$textInput.value = e.target.value;
	}
});