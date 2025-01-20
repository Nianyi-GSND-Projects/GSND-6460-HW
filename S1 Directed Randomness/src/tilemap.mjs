export class Tilemap {
	/** The side length of one tile by pixels. */
	tileSize = 30;
	/** The size of the map by tile count. */
	size = [20, 20];
	get pixelSize() {
		return this.size.map(v => v * this.tileSize)
	}
	/** The position of the map on canvas by pixel. */
	position = [10, 10];

	tiles = [];

	constructor() {
		this.tiles = Array(this.size[0]).fill(0).map(
			() => Array(this.size[1]).fill(undefined)
		);
	}

	IsValidPos(...args) {
		if(args[0] instanceof Array)
			return this.IsValidPos(...args[0]);
		return !args.some((v, i) => v < 0 || v >= this.size[i]);
	}

	At(...args) {
		if(args[0] instanceof Array)
			return this.At(...args[0]);
		if(!this.IsValidPos(...args))
			return null;
		const [x, y] = args;
		return this.tiles[x][y];
	}

	Set(tile, ...args) {
		if(args[0] instanceof Array)
			return this.Set(tile, ...args[0]);
		const [x, y] = args;
		if(!this.IsValidPos(...args))
			return;
		this.tiles[x][y] = tile;
	}

	*Positions() {
		for(let x = 0; x < this.size[0]; ++x) {
			for(let y = 0; y < this.size[1]; ++y) {
				yield [x, y];
			}
		}
	}

	*Tiles() {
		for(const pos of this.Positions()) {
			yield this.At(pos);
		}
	}

	// East, south, west, north.
	static directConnections = [[1, 0], [0, 1], [-1, 0], [0, -1]];
	*AdjacentOf(pos) {
		for(const offset of Tilemap.directConnections) {
			yield pos.map((v, i) => v + offset[i]);
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

		for(const pos of this.Positions())
			this.RenderAt(pos);

		pop();
	}

	RenderAt(pos) {
		const tile = this.At(pos);
		if(!tile)
			return;

		push();
		scale(this.tileSize);
		translate(...pos);

		beginClip();
		rect(0, 0, 1, 1);
		endClip();

		tile.Render();

		pop();
	}

	Update() {
		for(const pos of this.Positions())
			UpdateAt(pos);
	}

	UpdateAt(pos) {
		const tile = this.At(pos);
		if(!tile)
			return;

		tile.Update(this, pos);
	}
}

export class Tile {
	Render() {}

	/**
	 * @param {Tilemap} tilemap
	 * @param {[number, number]} pos
	 */
	Update(tilemap, pos) {}
}