var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/tilemap.mts
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
  IsValidPos(x, y) {
    return ![x, y].some((v, i) => v < 0 || v >= this.size[i]);
  }
  At(x, y) {
    if (!this.IsValidPos(x, y))
      return null;
    return this.tiles[x][y];
  }
  Set(tile, x, y) {
    if (!this.IsValidPos(x, y))
      return;
    this.tiles[x][y] = tile;
  }
  get Positions() {
    return function* () {
      for (let x = 0; x < this.size[0]; ++x) {
        for (let y = 0; y < this.size[1]; ++y) {
          yield [x, y];
        }
      }
    }.call(this);
  }
  get Tiles() {
    return function* () {
      for (const pos of this.Positions()) {
        const tile = this.At(...pos);
        if (tile)
          yield tile;
      }
    }.call(this);
  }
  // East, south, west, north.
  static directConnections = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  *AdjacentOf(x, y) {
    for (const offset of _Tilemap.directConnections) {
      yield [x, y].map((v, i) => v + offset[i]);
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
    for (const pos of this.Positions)
      this.RenderAt(...pos);
    pop();
  }
  RenderAt(x, y) {
    const tile = this.At(x, y);
    if (!tile)
      return;
    push();
    scale(this.tileSize);
    translate(x, y);
    beginClip();
    rect(0, 0, 1, 1);
    endClip();
    tile.Render();
    pop();
  }
  Update() {
    for (const pos of this.Positions)
      this.UpdateAt(...pos);
  }
  UpdateAt(x, y) {
    const tile = this.At(x, y);
    if (!tile)
      return;
    tile.Update(this, x, y);
  }
};
var Tile = class {
  Render() {
  }
  Update(tilemap, x, y) {
  }
};

// src/tiles.mts
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
  Update(tilemap, x, y) {
    for (const [i, offset] of Tilemap.directConnections.entries()) {
      this.connectivity[i] = tilemap.At(...[x, y].map((v, j) => v + offset[j])) instanceof _DirtPath;
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

// src/app.mts
var tileTypes = Object.values(tiles_exports);
var App = class {
  tilemap;
  iterator;
  finished;
  Initialize() {
    this.tilemap = new Tilemap();
    this.finished = false;
    this.iterator = this.Step();
  }
  *Step() {
    for (const pos of this.tilemap.Positions) {
      const tile = new (PickRandom(tileTypes))();
      this.tilemap.Set(tile, ...pos);
      const positions = [pos, ...this.tilemap.AdjacentOf(...pos)];
      this.tilemap.SetupTransform();
      for (const pos2 of positions) {
        this.tilemap.UpdateAt(...pos2);
        this.tilemap.RenderAt(...pos2);
      }
      yield;
    }
    this.finished = true;
  }
  Iterate() {
    if (this.finished)
      return;
    this.finished = this.iterator.next().done !== false;
  }
};
function PickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// src/index.mts
var app = new App();
function setup() {
  app.Initialize();
  const size = app.tilemap.position.map((v, i) => v * 2 + app.tilemap.pixelSize[i]);
  createCanvas(...size);
  background("gray");
}
function draw() {
  app.Iterate();
}
