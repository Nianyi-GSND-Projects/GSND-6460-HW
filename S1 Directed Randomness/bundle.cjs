var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/events/events.js
var require_events = __commonJS({
  "node_modules/events/events.js"(exports, module2) {
    "use strict";
    var R = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };
    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === "function") {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
      return value !== value;
    };
    function EventEmitter2() {
      EventEmitter2.init.call(this);
    }
    module2.exports = EventEmitter2;
    module2.exports.once = once;
    EventEmitter2.EventEmitter = EventEmitter2;
    EventEmitter2.prototype._events = void 0;
    EventEmitter2.prototype._eventsCount = 0;
    EventEmitter2.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }
    Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
        }
        defaultMaxListeners = arg;
      }
    });
    EventEmitter2.init = function() {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
      }
      this._maxListeners = n;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter2.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter2.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0)
        doError = doError && events.error === void 0;
      else if (!doError)
        return false;
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          throw er;
        }
        var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
        err.context = er;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0)
        return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          ReflectApply(listeners[i], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit(
            "newListener",
            type,
            listener.listener ? listener.listener : listener
          );
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w.name = "MaxListenersExceededWarning";
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }
      return target;
    }
    EventEmitter2.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
    EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter2.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0)
        return this;
      list = events[type];
      if (list === void 0)
        return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }
        if (position < 0)
          return this;
        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1)
          events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
    EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i;
      events = this._events;
      if (events === void 0)
        return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else
            delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === "removeListener") continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0)
        return [];
      var evlistener = events[type];
      if (evlistener === void 0)
        return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter2.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter2.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter2.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter2.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter2.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function(resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
  }
});

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
  IsValidPos(pos) {
    return !pos.some((v, i) => v < 0 || v >= this.size[i]);
  }
  At(pos) {
    if (!this.IsValidPos(pos))
      return null;
    return this.tiles[pos[0]][pos[1]];
  }
  Set(tile, pos) {
    if (!this.IsValidPos(pos))
      return;
    this.tiles[pos[0]][pos[1]] = tile;
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
      this.RenderAt(pos);
    pop();
  }
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
  Update() {
    for (const pos of this.Positions)
      this.UpdateAt(pos);
  }
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
  *Iterate(pos) {
    try {
      for (const step of this.Explore(pos))
        yield step;
    } catch (e) {
      if (e === "done")
        return;
      throw e;
    }
  }
  MakeStep(pos) {
    return {
      pos,
      remainingTypes: Object.values(tiles_exports),
      remainingNeighbors: Array.from(this.tilemap.NeighborsOf(pos)).filter((pos2) => this.IsNeighborEmpty(pos2))
    };
  }
  IsNeighborEmpty(pos) {
    return this.tilemap.IsValidPos(pos) && !this.tilemap.At(pos);
  }
  *Explore(pos) {
    const step = this.MakeStep(pos);
    this.path.push(step);
    while (step.remainingTypes.length) {
      const type = TakeRandom(step.remainingTypes);
      const tile = new type();
      this.tilemap.Set(tile, pos);
      yield step;
      if (!this.Validate(pos)) {
        this.temperature += 1;
        continue;
      }
      this.temperature /= 2;
      this.temperature = Math.max(0, this.temperature);
      if (this.stackSize >= this.tilemap.tileCount)
        throw "done";
      while (step.remainingNeighbors.length) {
        const neighbor = TakeRandom(step.remainingNeighbors);
        for (const subStep of this.Explore(neighbor))
          yield subStep;
      }
      const candidates = Array.from(this.tilemap.Positions).filter((pos2) => this.tilemap.At(pos2) === void 0);
      Shuffle(candidates);
      candidates.splice(3, candidates.length);
      while (candidates.length) {
        const neighbor = TakeRandom(candidates);
        for (const subStep of this.Explore(neighbor))
          yield subStep;
      }
    }
    const stepbackCount = Math.min(
      this.stackSize - 1,
      Math.floor(Math.exp(Math.random() * this.temperature * 0.1))
    );
    for (let i = 0; i < stepbackCount; ++i) {
      const stepback = this.path.pop();
      this.tilemap.Set(void 0, stepback.pos);
      yield stepback;
    }
  }
  Validate(pos) {
    if (!this.ValidateSingle(pos))
      return false;
    return true;
  }
  ValidateSingle(pos) {
    const tile = this.tilemap.At(pos);
    if (!tile)
      return true;
    for (const rule of this.ruleset) {
      if (!(tile instanceof rule.type))
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
function TakeRandom(arr) {
  const i = PickRandom([...arr.keys()]);
  return arr.splice(i, 1)[0];
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
var import_events = __toESM(require_events(), 1);
var App = class extends import_events.EventEmitter {
  /* Fields */
  tilemap = new Tilemap();
  ruleset = [];
  wfc;
  finished;
  iterator;
  iteration;
  /* Life cycle */
  Initialize() {
    this.ResetWfc();
  }
  Step() {
    if (this.finished)
      return;
    this.finished = this.iterator.next().done !== false;
    ++this.iteration;
    this.emit("iterate", this.iteration);
    if (this.finished)
      this.emit("done");
  }
  *IterateCoroutine() {
    const startingPos = Array(2).fill(0).map(
      (_, i) => Math.floor(Math.random() * this.tilemap.size[i])
    );
    for (const step of this.wfc.Iterate(startingPos)) {
      const pos = step.pos;
      this.tilemap.SetupTransform();
      const updateTargets = [pos, ...this.tilemap.NeighborsOf(pos, true)];
      for (const target of updateTargets) {
        this.tilemap.UpdateAt(target);
        this.tilemap.RenderAt(target);
      }
      const tile = this.tilemap.At(pos);
      console.log([
        `Stack size: ${this.wfc.stackSize}`,
        `${tile?.constructor?.name}@(${pos})`,
        `${this.wfc.Validate(pos) ? "succeed" : "failed"}`
      ].join(" "));
      yield;
    }
    this.finished = true;
  }
  ResetWfc() {
    for (const pos of this.tilemap.Positions)
      this.tilemap.Set(void 0, pos);
    this.wfc = new Wfc(this.tilemap, this.ruleset);
    this.finished = false;
    this.iterator = this.IterateCoroutine();
    this.iteration = 0;
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
      if (IsIsolatedPath(tilemap, pos))
        return false;
      return true;
    }
  },
  {
    type: Grass,
    match: (tilemap, pos) => {
      for (const neighbor of tilemap.NeighborsOf(pos)) {
        if (IsIsolatedPath(tilemap, neighbor))
          return false;
      }
      return true;
    }
  }
]);
function IsIsolatedPath(tilemap, pos) {
  if (!(tilemap.At(pos) instanceof DirtPath))
    return false;
  const neighbors = Array.from(tilemap.NeighborsOf(pos));
  if (neighbors.every((pos2) => tilemap.At(pos2) instanceof Grass))
    return true;
}
function InitializeApp() {
}
function setup() {
  app.Initialize();
  const size = app.tilemap.position.map(
    (v, i) => v * 2 + app.tilemap.pixelSize[i]
  );
  createCanvas(...size);
  background("gray");
  app.on("iterate", (i) => {
    if (i > CountKeys(tiles_exports) * 2 * app.tilemap.tileCount) {
      app.ResetWfc();
      app.tilemap.Render();
    }
  });
}
function draw() {
  app.Step();
}
function CountKeys(obj) {
  return Array.from(Object.keys(obj)).length;
}
