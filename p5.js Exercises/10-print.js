/* Configurations */

const step = 30;
const [w, h] = [15, 15];
const strokeWidth = 3;

/* Functions */

function draw10print(x, y, k) {
	k = (k + 1) * 0.5;
	line(
		x, y + k,
		x + 1, y + 1 - k
	);
}

// Directing algorithm
function dir(x, y) {
	return randomFlip(x, y);
	// return wave(x, y);
}

function randomFlip() {
	return +(Math.random() > 0.5) * 2 - 1;
}

function wave(x, y) {
	return (
		Math.sin(x / w * Math.PI * 2) +
		Math.cos(y / h * Math.PI * 2 / 3 + 1)
	) / 2;
}

/* p5.js life cycle */

function setup() {
	createCanvas(w * step, h * step);
	background(0, 64, 200);
	stroke('#ffffff');

	scale(step);
	strokeWeight(strokeWidth / step);

	for(let x = 0; x < w; ++x) {
		for(let y = 0; y < h; ++y) {
			draw10print(x, y, dir(x, y));
		}
	}
}