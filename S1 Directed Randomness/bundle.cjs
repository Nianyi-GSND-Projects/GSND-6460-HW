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
  static directNeighbors = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
  ];
  static corners = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ];
  *AdjacentOf(x, y, includeCorners = false) {
    const offsets = _Tilemap.directNeighbors.slice();
    if (includeCorners)
      offsets.push(..._Tilemap.corners);
    for (const offset of offsets) {
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
    for (const [i, start] of Tilemap.directNeighbors.entries()) {
      if (this.connectivity[i])
        line(...start.map((v) => (v + 1) / 2), 0.5, 0.5);
    }
  }
  Update(tilemap, x, y) {
    for (const [i, offset] of Tilemap.directNeighbors.entries()) {
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
  temperature = 0;
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
      remainingTypes: Object.values(tiles_exports),
      remainingNeighbors: Array.from(this.tilemap.AdjacentOf(x, y)).filter((pos) => this.IsNeighborEmpty(...pos))
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
      if (!this.Validate(x, y)) {
        this.temperature += 1;
        continue;
      }
      this.temperature -= 0.25;
      this.temperature = Math.max(0, this.temperature);
      if (this.stackSize >= this.tilemap.tileCount)
        throw "done";
      while (step.remainingNeighbors.length) {
        const neighbor = TakeRandom(step.remainingNeighbors);
        for (const subStep of this.Expore(...neighbor))
          yield subStep;
      }
      const candidates = Array.from(this.tilemap.Positions).filter((pos) => this.tilemap.At(...pos) === void 0);
      Shuffle(candidates);
      candidates.splice(3, candidates.length);
      while (candidates.length) {
        const neighbor = TakeRandom(candidates);
        for (const subStep of this.Expore(...neighbor))
          yield subStep;
      }
    }
    const stepbackCount = Math.floor(Math.exp((Math.random() + 1) * this.temperature * 0.05));
    for (let i = 0; i < stepbackCount; ++i) {
      const stepback = this.path.pop();
      this.tilemap.Set(void 0, ...stepback.pos);
      yield stepback;
    }
  }
  Validate(x, y) {
    if (!this.ValidateSingle(x, y))
      return false;
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
  tilemap = new Tilemap();
  finished;
  iterator;
  ruleset = [];
  wfc = new Wfc(this.tilemap, this.ruleset);
  /* Life cycle */
  Initialize() {
    this.finished = false;
    this.iterator = this.IterateCoroutine();
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
      const updateTargets = [pos, ...this.tilemap.AdjacentOf(...pos, true)];
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
app.tilemap.size = [10, 10];
app.tilemap.tileSize = 60;
app.ruleset.push(...[
  {
    type: DirtPath,
    match: (tilemap, pos) => {
      for (const corner of Tilemap.corners) {
        const a = [0, corner[1]], b = [corner[0], 0];
        const targetTiles = [a, b, corner].map((offset) => offset.map((v, i) => pos[i] + v)).map((pos2) => tilemap.At(...pos2));
        const allAre = targetTiles.every((tile) => tile instanceof DirtPath);
        if (allAre)
          return false;
      }
      if (IsIsolatedPath(tilemap, pos))
        return false;
      return true;
    }
  },
  {
    type: Grass,
    match: (tilemap, pos) => {
      for (const neighbor of tilemap.AdjacentOf(...pos)) {
        if (IsIsolatedPath(tilemap, neighbor))
          return false;
      }
      return true;
    }
  }
]);
function IsIsolatedPath(tilemap, pos) {
  if (!(tilemap.At(...pos) instanceof DirtPath))
    return false;
  const neighbors = Array.from(tilemap.AdjacentOf(...pos));
  if (neighbors.every((pos2) => tilemap.At(...pos2) instanceof Grass))
    return true;
}
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
