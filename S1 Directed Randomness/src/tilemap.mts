import './p5.mts';

export type Vector2 = [number, number];

/** The data structure for representing a tile-based map equipped with necessary interfaces. */
export class Tilemap {
	/** The side length of one tile by pixels. */
	tileSize = 30;
	/** The size of the map by tile count. */
	size: Vector2 = [20, 20];
	get pixelSize(): Vector2 {
		return this.size.map(v => v * this.tileSize) as Vector2;
	}
	/** The position of the map on canvas by pixel. */
	position: Vector2 = [10, 10];

	/**
	 * The internal registry of all tiles.
	 * Shouldn't be accessed externally.
	 */
	#tiles: Tile[][] = [];

	constructor() {
		this.#tiles = Array(this.size[0]).fill(0).map(
			() => Array(this.size[1]).fill(undefined)
		);
	}

	/** How many places for tile (including the empty ones) are there in this map. */
	get tileCount(): number {
		return this.size[0] * this.size[1];
	}

	/** Check if a position makes sense in this map. */
	IsValidPos(pos: Vector2): boolean {
		return !pos.some((v, i) => v < 0 || v >= this.size[i]);
	}

	/** Get the tile at the specified position. */
	At(pos: Vector2): Tile | null | undefined {
		if(!this.IsValidPos(pos))
			return null;
		return this.#tiles[pos[0]][pos[1]];
	}

	/** Set the tile at the specified position. */
	Set(tile: Tile, pos: Vector2) {
		if(!this.IsValidPos(pos))
			return;
		this.#tiles[pos[0]][pos[1]] = tile;
	}

	/** Iterate through all valid positions in this map. */
	get Positions(): Generator<Vector2> {
		return (function*() {
			for(let x = 0; x < this.size[0]; ++x) {
				for(let y = 0; y < this.size[1]; ++y) {
					yield [x, y];
				}
			}
		}).call(this);
	}

	/** Iterate through all the tiles (not including the empty ones) in this map. */
	get Tiles(): Generator<Tile> {
		return (function*() {
			for(const pos of this.Positions()) {
				const tile = this.At(...pos);
				if(tile)
					yield tile;
			}
		}).call(this);
	}

	// East, south, west, north.
	static directNeighbors: Vector2[] = [
		[+1, 0],
		[0, +1],
		[-1, 0],
		[0, -1]
	];
	// Northwest, northeast, southwest, southeast.
	static corners: Vector2[] = [
		[-1, -1],
		[+1, -1],
		[-1, +1],
		[+1, +1],
	];
	/** 
	 * Yield the adjecent positions of specified positions.
	 * @param includeCorners If true, the adjacent corners would be yield as well.
	 */
	*NeighborsOf(pos: Vector2, includeCorners: boolean = false): Generator<Vector2> {
		const offsets = Tilemap.directNeighbors.slice();
		if(includeCorners)
			offsets.push(...Tilemap.corners);
		for(const offset of offsets) {
			const neighbor = pos.map((v, i) => v + offset[i]) as Vector2;
			if(!this.IsValidPos(neighbor))
				continue;
			yield neighbor;
		}
	}

	/** Apply the offset in the bases to draw the tiles. */
	SetupTransform() {
		resetMatrix();
		translate(...this.position);
	}

	/** Draw every tile. */
	Render() {
		push();
		this.SetupTransform();

		// Use a clipping mask to prevent over-drawing.
		beginClip();
		rect(0, 0, ...this.pixelSize);
		endClip();

		for(const pos of this.Positions)
			this.RenderAt(pos);

		pop();
	}

	/** Render one single tile at specified position. */
	RenderAt(pos: Vector2) {
		const tile = this.At(pos);

		// Modify the bases so that the four vertices of the tile is on the unit square.
		push();
		scale(this.tileSize);
		translate(...pos);

		// Use a clipping mask to prevent over-drawing.
		beginClip();
		rect(0, 0, 1, 1);
		endClip();

		if(tile)
			tile.Render();
		else
			// If the position is empty, clear any previously drawn tile.
			clear();

		pop();
	}

	/** Update the internal states of every tile. */
	Update() {
		for(const pos of this.Positions)
			this.UpdateAt(pos);
	}

	/** Update one single tile at specified position. */
	UpdateAt(pos: Vector2) {
		const tile = this.At(pos);
		if(!tile)
			return;

		tile.Update(this, pos);
	}
}
export default Tilemap;

/** The base class for a tile in the map. */
export abstract class Tile {
	Render(): void {}

	Update(tilemap: Tilemap, pos: Vector2): void {}
}