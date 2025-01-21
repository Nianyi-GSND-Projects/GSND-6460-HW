import './p5.mts';
import App from './app.mts';
import { Tilemap, Vector2 } from './tilemap.mjs';
import * as Tiles from './tiles.mjs';

const app = new App();
app.ruleset = [
	{
		type: Tiles.DirtPath,
		match: (tilemap: Tilemap, pos: Vector2) => {
			const up = tilemap.At(pos[0], pos[1] - 1);
			if(!up)
				return true;
			return Math.random() > 0.8 || up instanceof Tiles.DirtPath;
		}
	},
	{
		type: Tiles.Grass,
		match: (tilemap: Tilemap, pos: Vector2) => true,
	},
];

function setup() {
	app.Initialize();

	const size = app.tilemap.position.map(
		(v, i) => v * 2 + app.tilemap.pixelSize[i]
	) as Vector2;
	createCanvas(...size);
	background('gray');
}

function draw() {
	app.Step();
}