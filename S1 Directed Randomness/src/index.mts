import './p5.mts';
import { App, type Vector2 } from './app.mts';

const app = new App();

function setup() {
	app.Initialize();

	const size = app.tilemap.position.map((v, i) => v * 2 + app.tilemap.pixelSize[i]) as Vector2;
	createCanvas(...size);
	background('gray');
}

function draw() {
	app.Iterate();
}