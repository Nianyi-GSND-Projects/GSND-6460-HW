var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/tilemap.mjs
var Tilemap = class _Tilemap {
  /** The side length of one tile by pixels. */
  tileSize = 30;
  /** The size of the map by tile count. */
  size = [20, 20];
  get pixelSize() {
    return this.size.map((v) => v * this.tileSize);
  }
  /** The position of the map on canvas by pixel. */
  position = [10, 10];
  tiles = [];
  constructor() {
    this.tiles = Array(this.size[0]).fill(0).map(
      () => Array(this.size[1]).fill(void 0)
    );
  }
  IsValidPos(...args) {
    if (args[0] instanceof Array)
      return this.IsValidPos(...args[0]);
    return !args.some((v, i) => v < 0 || v >= this.size[i]);
  }
  At(...args) {
    if (args[0] instanceof Array)
      return this.At(...args[0]);
    if (!this.IsValidPos(...args))
      return null;
    const [x, y] = args;
    return this.tiles[x][y];
  }
  Set(tile, ...args) {
    if (args[0] instanceof Array)
      return this.Set(tile, ...args[0]);
    const [x, y] = args;
    if (!this.IsValidPos(...args))
      return;
    this.tiles[x][y] = tile;
  }
  *Positions() {
    for (let x = 0; x < this.size[0]; ++x) {
      for (let y = 0; y < this.size[1]; ++y) {
        yield [x, y];
      }
    }
  }
  *Tiles() {
    for (const pos of this.Positions()) {
      yield this.At(pos);
    }
  }
  // East, south, west, north.
  static directConnections = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  *AdjacentOf(pos) {
    for (const offset of _Tilemap.directConnections) {
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
    for (const pos of this.Positions())
      this.RenderAt(pos);
    pop();
  }
  RenderAt(pos) {
    const tile = this.At(pos);
    if (!tile)
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
    for (const pos of this.Positions())
      UpdateAt(pos);
  }
  UpdateAt(pos) {
    const tile = this.At(pos);
    if (!tile)
      return;
    tile.Update(this, pos);
  }
};
var Tile = class {
  Render() {
  }
  /**
   * @param {Tilemap} tilemap
   * @param {[number, number]} pos
   */
  Update(tilemap2, pos) {
  }
};

// src/tiles.mjs
var tiles_exports = {};
__export(tiles_exports, {
  DirtPath: () => DirtPath,
  Grass: () => Grass
});
var DirtPath = class _DirtPath extends Tile {
  connectivity = [false, false, false, false];
  constructor() {
    super();
    for (const [i] of this.connectivity.entries()) {
      this.connectivity[i] = Math.random() > 0.5;
    }
  }
  Render() {
    fill("#8a6038");
    stroke("none");
    strokeWeight(0);
    rect(0, 0, 1, 1);
    fill("none");
    stroke("white");
    strokeWeight(0.3);
    for (const [i, start] of Tilemap.directConnections.entries()) {
      if (this.connectivity[i])
        line(...start.map((v) => (v + 1) / 2), 0.5, 0.5);
    }
  }
  Update(tilemap2, pos) {
    for (const [i, offset] of Tilemap.directConnections.entries()) {
      this.connectivity[i] = tilemap2.At(pos.map((v, j) => v + offset[j])) instanceof _DirtPath;
    }
  }
};
var Grass = class extends Tile {
  Render() {
    fill("#289f4c");
    stroke("none");
    strokeWeight(0);
    rect(0, 0, 1, 1);
  }
};

// src/index.mjs
var tileTypes = Object.values(tiles_exports);
var tilemap = new Tilemap();
function* Step() {
  for (const pos of tilemap.Positions()) {
    const tile = new (PickRandom(tileTypes))();
    tilemap.Set(tile, pos);
    const positions = [pos, ...tilemap.AdjacentOf(pos)];
    tilemap.SetupTransform();
    for (const pos2 of positions) {
      tilemap.UpdateAt(pos2);
      tilemap.RenderAt(pos2);
    }
    yield;
  }
}
function setup() {
  createCanvas(620, 620);
  background("gray");
}
var step = Step();
var done = false;
function draw() {
  if (!done) {
    done = step.next().done !== false;
  }
}
function PickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
