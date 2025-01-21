import './p5.mts';

export type Vector2 = [number, number];

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

	tiles: Tile[][] = [];

	constructor() {
		this.tiles = Array(this.size[0]).fill(0).map(
			() => Array(this.size[1]).fill(undefined)
		);
	}

	get tileCount(): number {
		return this.size[0] * this.size[1];
	}

	IsValidPos(x: number, y: number): boolean {
		return ![x, y].some((v, i) => v < 0 || v >= this.size[i]);
	}

	At(x: number, y: number): Tile | null | undefined {
		if(!this.IsValidPos(x, y))
			return null;
		return this.tiles[x][y];
	}

	Set(tile: Tile, x: number, y: number) {
		if(!this.IsValidPos(x, y))
			return;
		this.tiles[x][y] = tile;
	}

	get Positions(): Generator<Vector2> {
		return (function*() {
			for(let x = 0; x < this.size[0]; ++x) {
				for(let y = 0; y < this.size[1]; ++y) {
					yield [x, y];
				}
			}
		}).call(this);
	}

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
	static corners: Vector2[] = [
		[-1, -1],
		[+1, -1],
		[-1, +1],
		[+1, +1],
	];
	*AdjacentOf(x: number, y: number, includeCorners: boolean = false): Generator<Vector2> {
		const offsets = Tilemap.directNeighbors.slice();
		if(includeCorners)
			offsets.push(...Tilemap.corners);
		for(const offset of offsets) {
			const pos = [x, y].map((v, i) => v + offset[i]) as Vector2;
			if(!this.IsValidPos(...pos))
				continue;
			yield pos;
		}
	}

	SetupTransform() {
		resetMatrix();
		translate(...this.position);
	}

	Render() {
		push();
		this.SetupTransform();

		beginClip();
		rect(0, 0, ...this.pixelSize);
		endClip();

		for(const pos of this.Positions)
			this.RenderAt(...pos);

		pop();
	}

	RenderAt(x: number, y: number) {
		const tile = this.At(x, y);

		push();
		scale(this.tileSize);
		translate(x, y);

		beginClip();
		rect(0, 0, 1, 1);
		endClip();

		if(tile)
			tile.Render();
		else
			clear();

		pop();
	}

	Update() {
		for(const pos of this.Positions)
			this.UpdateAt(...pos);
	}

	UpdateAt(x: number, y: number) {
		const tile = this.At(x, y);
		if(!tile)
			return;

		tile.Update(this, x, y);
	}
}
export default Tilemap;

export abstract class Tile {
	Render(): void {}

	Update(tilemap: Tilemap, x: number, y: number): void {}
}