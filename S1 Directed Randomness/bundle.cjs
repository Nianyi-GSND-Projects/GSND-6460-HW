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
  get tileCount() {
    return this.size[0] * this.size[1];
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
      const pos = [x, y].map((v, i) => v + offset[i]);
      if (!this.IsValidPos(...pos))
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
    for (const pos of this.Positions)
      this.RenderAt(...pos);
    pop();
  }
  RenderAt(x, y) {
    const tile = this.At(x, y);
    push();
    scale(this.tileSize);
    translate(x, y);
    beginClip();
    rect(0, 0, 1, 1);
    endClip();
    if (tile)
      tile.Render();
    else
      clear();
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
var tilemap_default = Tilemap;
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

// src/wfc.mts
var Wfc = class {
  tilemap;
  path = [];
  ruleset;
  constructor(tilemap, ruleset) {
    this.tilemap = tilemap;
    this.ruleset = ruleset;
  }
  get stackSize() {
    return this.path.length;
  }
  *Iterate(x, y) {
    try {
      for (const step of this.Expore(x, y))
        yield step;
    } catch (e) {
      if (e === "done")
        return;
      throw e;
    }
  }
  MakeStep(x, y) {
    return {
      pos: [x, y],
      remainingTypes: Object.values(tiles_exports)
    };
  }
  IsNeighborEmpty(x, y) {
    return this.tilemap.IsValidPos(x, y) && !this.tilemap.At(x, y);
  }
  *Expore(x, y) {
    const step = this.MakeStep(x, y);
    this.path.push(step);
    while (step.remainingTypes.length) {
      const type = TakeRandom(step.remainingTypes);
      const tile = new type();
      this.tilemap.Set(tile, x, y);
      yield step;
      if (!this.Validate(x, y))
        continue;
      if (this.stackSize >= this.tilemap.tileCount)
        throw "done";
      for (const source of TraverseReversed(this.path)) {
        const neighbors = Array.from(this.tilemap.AdjacentOf(...source.pos));
        while (neighbors.length) {
          const neighbor = TakeRandom(neighbors);
          if (!this.IsNeighborEmpty(...neighbor))
            continue;
          for (const subStep of this.Expore(...neighbor))
            yield subStep;
        }
      }
    }
    this.tilemap.Set(void 0, x, y);
    yield this.path.pop();
  }
  Validate(x, y) {
    if (!this.ValidateSingle(x, y))
      return false;
    for (const neighbor of this.tilemap.AdjacentOf(x, y)) {
      if (!this.ValidateSingle(...neighbor))
        return false;
    }
    return true;
  }
  ValidateSingle(x, y) {
    const tile = this.tilemap.At(x, y);
    if (!tile)
      return true;
    for (const rule of this.ruleset) {
      if (!(tile instanceof rule.type))
        continue;
      if (!rule.match(this.tilemap, [x, y]))
        return false;
    }
    return true;
  }
};
function PickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function TakeRandom(arr) {
  const i = PickRandom([...arr.keys()]);
  return arr.splice(i, 1)[0];
}
function LastOf(arr) {
  return arr[arr.length - 1];
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
function Remove(arr, val) {
  const i = arr.indexOf(val);
  if (i === -1)
    return;
  arr.splice(i, 1);
}
function* TraverseReversed(arr) {
  for (let i = arr.length; i > 0; --i)
    yield arr[i - 1];
}

// src/app.mts
var App = class {
  tilemap;
  finished;
  iterator;
  wfc;
  ruleset;
  /* Life cycle */
  Initialize() {
    this.tilemap = new Tilemap();
    this.finished = false;
    this.iterator = this.IterateCoroutine();
    this.wfc = new Wfc(this.tilemap, this.ruleset);
  }
  Step() {
    if (this.finished)
      return;
    this.finished = this.iterator.next().done !== false;
  }
  *IterateCoroutine() {
    const startingPos = Array(2).fill(0).map(
      (_, i) => Math.floor(Math.random() * this.tilemap.size[i])
    );
    for (const step of this.wfc.Iterate(...startingPos)) {
      const pos = step.pos;
      this.tilemap.SetupTransform();
      const updateTargets = [pos, ...this.tilemap.AdjacentOf(...pos)];
      for (const target of updateTargets) {
        this.tilemap.UpdateAt(...target);
        this.tilemap.RenderAt(...target);
      }
      const tile = this.tilemap.At(...pos);
      console.log([
        `Stack size: ${this.wfc.stackSize}`,
        `${tile?.constructor?.name}@(${pos})`,
        `${this.wfc.Validate(...pos) ? "succeed" : "failed"}`
      ].join(" "));
      yield;
    }
    this.finished = true;
  }
};
var app_default = App;

// src/index.mts
var app = new app_default();
app.ruleset = [
  {
    type: DirtPath,
    match: (tilemap, pos) => {
      const up = tilemap.At(pos[0], pos[1] - 1);
      if (!up)
        return true;
      return Math.random() > 0.8 || up instanceof DirtPath;
    }
  },
  {
    type: Grass,
    match: (tilemap, pos) => true
  }
];
function setup() {
  app.Initialize();
  const size = app.tilemap.position.map(
    (v, i) => v * 2 + app.tilemap.pixelSize[i]
  );
  createCanvas(...size);
  background("gray");
}
function draw() {
  app.Step();
}
