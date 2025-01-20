/* Auxiliary functions */

const rnd = Math.random;
const arrN = (n, fn) => Array(n).fill(0).map((_, i) => fn(i));
const rndColor = () => color(...arrN(3, () => rnd() * 256));

/* Configurations */

const [w, h] = [400, 400];
const size = [w, h];

const backgroundColor = 128;
const strokeVariance = 10;

/* Functions */

function scribble() {
	const c = frameCount & 1 ? rndColor() : color(0, 0, 0);
	stroke(c);
	strokeWeight(rnd() * strokeVariance + 1);
	line(...arrN(4, i => rnd() * size[i & 1]));
}

/* p5.js life event */

function setup() {
	createCanvas(...size);
	background(backgroundColor);
}

function draw() {
	scribble();
}