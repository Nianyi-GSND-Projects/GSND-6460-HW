import { Tilemap } from './tilemap.mjs';
import * as Tiles from './tiles.mjs';

/* Intialization */

const tileTypes = Object.values(Tiles);
let tilemap = new Tilemap();

const ruleset = [
	{
		type: Tiles.DirtPath,
		fn: (tilemap, pos) => {
			const up = tilemap.At(pos[0], pos[1] - 1);
			if(!up)
				return true;
			return up instanceof Tiles.DirtPath;
		}
	},
];

/* Functions */

function *Step() {
	for(const pos of tilemap.Positions()) {
		const tile = new (PickRandom(tileTypes));
		tilemap.Set(tile, pos);
		const positions = [pos, ...tilemap.AdjacentOf(pos)];
		tilemap.SetupTransform();
		for(const pos of positions) {
			tilemap.UpdateAt(pos);
			tilemap.RenderAt(pos);
		}
		yield;
	}
}

/* p5.js life events */

function setup() {
	createCanvas(620, 620);
	background('gray');
}

let step = Step();
let done = false;
function draw() {
	if(!done) {
		done = step.next().done !== false;
	}
}

/* Auxiliary functions */

function PickRandom(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}