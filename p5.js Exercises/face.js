/** Configs */

function MakeRandomFace() {
	return {
		eyes: {
			width: rand(10, 50),
			height: rand(5, 30),
			spacing: rand(30, 200),
			color: 'blue',
		},
		mouth: {
			width: rand(10, 100),
			height: rand(2, 80),
		},
	};
}

let face = MakeRandomFace(), nextFace = null;

function StepFace(t = 0.1) {
	if(!nextFace)
		return;

	face.eyes.width = lerp(face.eyes.width, nextFace.eyes.width, t);
	face.eyes.height = lerp(face.eyes.height, nextFace.eyes.height, t);
	face.eyes.spacing = lerp(face.eyes.spacing, nextFace.eyes.spacing, t);

	face.mouth.width = lerp(face.mouth.width, nextFace.mouth.width, t);
	face.mouth.height = lerp(face.mouth.height, nextFace.mouth.height, t);
}

/** Functions */

function rand(a, b) {
	return Math.random() * (b - a) + a;
}

function drawFace(x, y) {
	drawEyes(x - (face.eyes.width * 2 + face.eyes.spacing) / 2, y);
	drawMouth(x, y + face.eyes.height);
}

function drawEye(x, y) {
	fill(face.eyes.color);
	ellipse(x, y, face.eyes.width, face.eyes.height);
}

function drawEyes(x, y) {
	drawEye(x, y);
	drawEye(x + face.eyes.spacing + face.eyes.width, y);
}

function drawMouth(x, y) {
	fill('black');
	ellipse(x, y, face.mouth.width, face.mouth.height);
}

/** p5.js life events */

function setup() {
	createCanvas(500, 500);
}

function draw() {
	background(220);
	drawFace(width / 2, height / 2);
	StepFace();
}

function mousePressed() {
	nextFace = MakeRandomFace();
}