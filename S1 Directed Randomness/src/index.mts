import './p5.mts';
import App from './app.mts';
import { Tilemap, Vector2 } from './tilemap.mjs';
import * as Tiles from './tiles.mjs';

/* App */

const app = new App();

app.tilemap.size = [10, 10];
app.tilemap.tileSize = 60;
app.ruleset.push(...[
	{
		type: Tiles.DirtPath,
		match: (tilemap: Tilemap, pos: Vector2) => {
			// Ban small loops.
			for(const corner of Tilemap.corners) {
				const a = [0, corner[1]], b = [corner[0], 0];
				const targetTiles = [a, b, corner]
					.map(offset => offset.map((v, i) => pos[i] + v) as Vector2)
					.map(pos => tilemap.At(pos));
				const allAre = targetTiles.every(tile => tile instanceof Tiles.DirtPath);
				if(allAre)
					return false;
			}

			return true;
		}
	},
]);

/* p5.js life cycle */

function setup() {
	const size = app.tilemap.position.map(
		(v, i) => v * 2 + app.tilemap.pixelSize[i]
	) as Vector2;
	createCanvas(...size);
	background('gray');
	
	app.Initialize();
}

function draw() {
	app.Step();
}

function keyPressed() {
	switch(keyCode) {
		case LEFT_ARROW:
			app.Scroll([-1, 0]);
			break;
		case RIGHT_ARROW:
			app.Scroll([+1, 0]);
			break;
		case UP_ARROW:
			app.Scroll([0, -1]);
			break;
		case DOWN_ARROW:
			app.Scroll([0, +1]);
			break;
	}
}

/* */

function CountKeys(obj: Object): number {
	return Array.from(Object.keys(obj)).length;
}