import { Tilemap, Tile, type Vector2 } from './tilemap.mjs';

/**
 * A kind of tile that is brown in the background with white color-stroked paths.
 * The paths will automatically connect when two of this kind of tiles are adjacent.
 */
export class DirtPath extends Tile {
	/** The internal registry for the connectivity to adjacent tiles. */
	connectivity = [false, false, false, false];

	constructor() {
		super();
		for(const [i, ] of this.connectivity.entries()) {
			this.connectivity[i] = Math.random() > 0.5;
		}
	}

	override Render() {
		fill('#8a6038');
		stroke('none');
		strokeWeight(0);
		rect(0, 0, 1, 1);

		fill('none');
		stroke('white');
		strokeWeight(0.3);

		for(const [i, start] of Tilemap.directNeighbors.entries()) {
			if(this.connectivity[i])
				line(...(start.map(v => (v + 1) / 2) as Vector2), 0.5, 0.5);
		}
	}

	override Update(tilemap: Tilemap, pos: Vector2) {
		for(const [i, offset] of Tilemap.directNeighbors.entries()) {
			this.connectivity[i] = tilemap.At((pos.map((v, j) => v + offset[j]) as Vector2)) instanceof DirtPath;
		}
	}
}

/** Simple green-colored grass tile. */
export class Grass extends Tile {
	override Render() {
		fill('#289f4c');
		stroke('none');
		strokeWeight(0);
		rect(0, 0, 1, 1);
	}
}