/*
 * Nianyi Wang's homework for GSND 6460: Generative Game Design - Sketch 1
 * 
 * This program is bundled from source code automatically.
 * For the original code comments and more information about the source
 * project, open the URL below.
 * 
 * https://github.com/Nianyi-GSND-Projects/GSND-6460-HW/tree/master/S1%20Directed%20Randomness/
 */
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
  /**
   * The internal registry of all tiles.
   * Shouldn't be accessed externally.
   */
  #tiles = [];
  constructor() {
    this.#tiles = Array(this.size[0]).fill(0).map(
      () => Array(this.size[1]).fill(void 0)
    );
  }
  /** How many places for tile (including the empty ones) are there in this map. */
  get tileCount() {
    return this.size[0] * this.size[1];
  }
  /** Check if a position makes sense in this map. */
  IsValidPos(pos) {
    return !pos.some((v, i) => v < 0 || v >= this.size[i]);
  }
  /** Get the tile at the specified position. */
  At(pos) {
    if (!this.IsValidPos(pos))
      return null;
    return this.#tiles[pos[0]][pos[1]];
  }
  /** Set the tile at the specified position. */
  Set(tile, pos) {
    if (!this.IsValidPos(pos))
      return;
    this.#tiles[pos[0]][pos[1]] = tile;
  }
  /** Iterate through all valid positions in this map. */
  get Positions() {
    return function* () {
      for (let x = 0; x < this.size[0]; ++x) {
        for (let y = 0; y < this.size[1]; ++y) {
          yield [x, y];
        }
      }
    }.call(this);
  }
  /** Iterate through all the tiles (not including the empty ones) in this map. */
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
  static directNeighbors = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
  ];
  // Northwest, northeast, southwest, southeast.
  static corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ];
  /** 
   * Yield the adjecent positions of specified positions.
   * @param includeCorners If true, the adjacent corners would be yield as well.
   */
  *NeighborsOf(pos, includeCorners = false) {
    const offsets = _Tilemap.directNeighbors.slice();
    if (includeCorners)
      offsets.push(..._Tilemap.corners);
    for (const offset of offsets) {
      const neighbor = pos.map((v, i) => v + offset[i]);
      if (!this.IsValidPos(neighbor))
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
    beginClip();
    rect(0, 0, ...this.pixelSize);
    endClip();
    for (const pos of this.Positions)
      this.RenderAt(pos);
    pop();
  }
  /** Render one single tile at specified position. */
  RenderAt(pos) {
    const tile = this.At(pos);
    push();
    scale(this.tileSize);
    translate(...pos);
    beginClip();
    rect(0, 0, 1, 1);
    endClip();
    if (tile)
      tile.Render();
    else
      clear();
    pop();
  }
  /** Update the internal states of every tile. */
  Update() {
    for (const pos of this.Positions)
      this.UpdateAt(pos);
  }
  /** Update one single tile at specified position. */
  UpdateAt(pos) {
    const tile = this.At(pos);
    if (!tile)
      return;
    tile.Update(this, pos);
  }
};
var tilemap_default = Tilemap;
var Tile = class {
  Render() {
  }
  Update(tilemap, pos) {
  }
};

// src/tiles.mts
var tiles_exports = {};
__export(tiles_exports, {
  DirtPath: () => DirtPath,
  Grass: () => Grass
});
var DirtPath = class _DirtPath extends Tile {
  /** The internal registry for the connectivity to adjacent tiles. */
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
    for (const [i, start] of Tilemap.directNeighbors.entries()) {
      if (this.connectivity[i])
        line(...start.map((v) => (v + 1) / 2), 0.5, 0.5);
    }
  }
  Update(tilemap, pos) {
    for (const [i, offset] of Tilemap.directNeighbors.entries()) {
      this.connectivity[i] = tilemap.At(pos.map((v, j) => v + offset[j])) instanceof _DirtPath;
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

// src/wfc.mts
var tileTypes = Object.values(tiles_exports);
var Wfc = class {
  app;
  /** All the tiles that needs to be resolved by this instance. */
  targetTiles;
  /** The tiles that hasn't been resolved in the current try. */
  remainingTiles;
  get tilemap() {
    return this.app.tilemap;
  }
  get ruleset() {
    return this.app.ruleset;
  }
  constructor(app2) {
    this.app = app2;
    this.targetTiles = Array.from(this.tilemap.Positions).filter((pos) => !this.tilemap.At(pos));
  }
  /** The core loop of the WFC algorithm. */
  *Iterate() {
    while (true) {
      this.remainingTiles = this.targetTiles.slice();
      let bad = false;
      while (this.remainingTiles.length) {
        try {
          yield this.PerformGeneration();
        } catch (e) {
          if (e !== "bad")
            throw e;
          bad = true;
          break;
        }
      }
      if (bad) {
        for (const pos of this.targetTiles)
          this.tilemap.Set(void 0, pos);
        continue;
      }
      return;
    }
  }
  /**
   * Decide the type of a tile with minimal possibilities.
   * i.e. the atomic operation in the WFC algorithm.
   * Failed if 'bad' was thrown.
   */
  PerformGeneration() {
    const candidates = this.remainingTiles.map((pos, i) => {
      const types = tileTypes.filter((type2) => this.Validate(type2, pos));
      return { pos, validTypes: types, i };
    });
    Shuffle(candidates);
    candidates.sort((a, b) => a.validTypes.length - b.validTypes.length);
    const candidate = candidates[0];
    if (candidate.validTypes.length === 0)
      throw "bad";
    const type = PickRandom(candidate.validTypes);
    this.tilemap.Set(new type(), candidate.pos);
    this.remainingTiles.splice(candidate.i, 1);
    return candidate.pos;
  }
  /** See if assigning the specified type to the specified position would be valid. */
  Validate(type, pos) {
    for (const rule of this.ruleset) {
      if (type !== rule.type)
        continue;
      if (!rule.match(this.tilemap, pos))
        return false;
    }
    return true;
  }
};
function PickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function Shuffle(arr) {
  let currentIndex = arr.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex]
    ];
  }
}

// src/app.mts
var App = class {
  /* Fields */
  tilemap = new Tilemap();
  ruleset = [];
  iterator = null;
  /* Interfaces */
  /**
   * Step one frame forward.
   * Should be called in draw().
   */
  Step() {
    if (!this.iterator)
      return;
    const { done } = this.iterator.next();
    if (done)
      this.iterator = null;
  }
  /** Pan the entire map to specified direction. */
  PanMap(offset) {
    const pairs = Array.from(this.tilemap.Positions).map((pos) => ({
      pos,
      tile: this.tilemap.At(pos.map((v, i) => v + offset[i]))
    }));
    for (const { pos, tile } of pairs)
      this.tilemap.Set(tile, pos);
    this.FillEmpty();
  }
  /**
   * Initiate the process of filling all empty tiles.
   * The field `iterator` then needs to be manually iterated.
   */
  FillEmpty() {
    this.iterator = this.#Wfc();
  }
  /* Functions */
  *#Wfc() {
    const wfc = new Wfc(this);
    yield;
    for (const _ of wfc.Iterate()) {
      this.tilemap.Update();
      this.tilemap.Render();
      yield;
    }
  }
};
var app_default = App;

// src/index.mts
var app = new app_default();
app.tilemap.size = [10, 10];
app.tilemap.tileSize = 60;
app.ruleset.push(...[
  {
    type: DirtPath,
    match: (tilemap, pos) => {
      for (const corner of Tilemap.corners) {
        const a = [0, corner[1]], b = [corner[0], 0];
        const targetTiles = [a, b, corner].map((offset) => offset.map((v, i) => pos[i] + v)).map((pos2) => tilemap.At(pos2));
        const allAre = targetTiles.every((tile) => tile instanceof DirtPath);
        if (allAre)
          return false;
      }
      return true;
    }
  }
]);
function setup() {
  const size = app.tilemap.position.map(
    (v, i) => v * 2 + app.tilemap.pixelSize[i]
  );
  createCanvas(...size);
  background("gray");
  app.FillEmpty();
}
function draw() {
  app.Step();
}
function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      app.PanMap([-1, 0]);
      break;
    case RIGHT_ARROW:
      app.PanMap([1, 0]);
      break;
    case UP_ARROW:
      app.PanMap([0, -1]);
      break;
    case DOWN_ARROW:
      app.PanMap([0, 1]);
      break;
  }
}
