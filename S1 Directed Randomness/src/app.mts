import { Tile, Tilemap } from './tilemap.mjs';
export type { Vector2 } from './tilemap.mts';
import * as Tiles from './tiles.mjs';

const tileTypes = Object.values(Tiles);

export class App {
	tilemap: Tilemap;
	iterator: Generator;
	finished: boolean;

	Initialize() {
		this.tilemap = new Tilemap();
		this.finished = false;
		this.iterator = this.Step();
	}

	*Step() {
		for(const pos of this.tilemap.Positions) {
			const tile = new (PickRandom(tileTypes));
			this.tilemap.Set(tile, ...pos);
			const positions = [pos, ...this.tilemap.AdjacentOf(...pos)];
			this.tilemap.SetupTransform();
			for(const pos of positions) {
				this.tilemap.UpdateAt(...pos);
				this.tilemap.RenderAt(...pos);
			}
			yield;
		}
		this.finished = true;
	}

	Iterate() {
		if(this.finished)
			return;
		this.finished = this.iterator.next().done !== false;
	}
}


/* Auxiliary functions */

function PickRandom<T>(arr: Array<T>): T {
	return arr[Math.floor(Math.random() * arr.length)];
}