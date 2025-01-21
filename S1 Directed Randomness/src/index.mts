import './p5.mts';
import App from './app.mts';
import { Tilemap, Vector2 } from './tilemap.mjs';
import * as Tiles from './tiles.mjs';

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
					.map(pos => tilemap.At(...pos));
				const allAre = targetTiles.every(tile => tile instanceof Tiles.DirtPath);
				if(allAre)
					return false;
			}

			// Ban isolated tiles.
			if(IsIsolatedPath(tilemap, pos))
				return false;

			return true;
		}
	},
	{
		type: Tiles.Grass,
		match: (tilemap: Tilemap, pos: Vector2) => {
			for(const neighbor of tilemap.AdjacentOf(...pos)) {
				if(IsIsolatedPath(tilemap, neighbor))
					return false;
			}
			return true;
		}
	},
]);

function IsIsolatedPath(tilemap: Tilemap, pos: Vector2) {
	if(!(tilemap.At(...pos) instanceof Tiles.DirtPath))
		return false;
	const neighbors = Array.from(tilemap.AdjacentOf(...pos));
	if(neighbors.every(pos => tilemap.At(...pos) instanceof Tiles.Grass))
		return true;
}

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