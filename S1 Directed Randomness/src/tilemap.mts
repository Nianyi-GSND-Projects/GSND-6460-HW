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

	IsValidPos(pos: Vector2): boolean {
		return !pos.some((v, i) => v < 0 || v >= this.size[i]);
	}

	At(pos: Vector2): Tile | null | undefined {
		if(!this.IsValidPos(pos))
			return null;
		return this.tiles[pos[0]][pos[1]];
	}

	Set(tile: Tile, pos: Vector2) {
		if(!this.IsValidPos(pos))
			return;
		this.tiles[pos[0]][pos[1]] = tile;
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
			this.RenderAt(pos);

		pop();
	}

	RenderAt(pos: Vector2) {
		const tile = this.At(pos);

		push();
		scale(this.tileSize);
		translate(...pos);

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
			this.UpdateAt(pos);
	}

	UpdateAt(pos: Vector2) {
		const tile = this.At(pos);
		if(!tile)
			return;

		tile.Update(this, pos);
	}
}
export default Tilemap;

export abstract class Tile {
	Render(): void {}

	Update(tilemap: Tilemap, pos: Vector2): void {}
}