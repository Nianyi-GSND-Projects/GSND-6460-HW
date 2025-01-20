/* Auxiliary functions */

const rnd = Math.random;
const arrN = (n, fn) => Array(n).fill(0).map((_, i) => fn(i));
const rndColor = () => color(...arrN(3, () => rnd() * 256));

/* Configurations */

const [w, h] = [400, 400];
const size = [w, h];

const backgroundColor = 128;
const userName = prompt("wat is yur name?");
const greetingFormat = "Ahoy, $!";

/* States */

let hasGreeted = false;
let clickCounter = 0;

/* Functions */

function greet() {
	console.log(greetingFormat.replace('$', userName));
	hasGreeted = true;
}

/* p5.js life event */

function setup() {
	createCanvas(...size);
	background(backgroundColor);
}

function mouseClicked() {
	if(!hasGreeted)
		greet();

	++clickCounter;
	console.log(`Click counter: ${clickCounter}.`);

	const mousePosition = [mouseX, mouseY];
	console.log(`Mouse position: ${mousePosition}.`);
}