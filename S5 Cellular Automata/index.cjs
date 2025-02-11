function setup() {
	// Disable right-click menu.
	document.addEventListener('contextmenu', event => event.preventDefault());

	app.Init();
}

function draw() {
	app.Update(Math.min(deltaTime / 1e3, 1 / getTargetFrameRate()));
	if(mouseIsPressed) {
		const v = mouseButton === LEFT ? 1 : mouseButton === RIGHT ? -1 : 0;
		app.Interact([mouseX / width, mouseY / height], v);
	}
	app.Render();
}

class CellularAutomata {
	constructor(size) {
		this.size = size;
		this.data = Array(this.size[0] * this.size[1]);
	}

	/* Key methods */

	SetByFn(fn) {
		for(const pos of this.Positions)
			this.Set(pos, fn(pos));
	}

	Update(dt) {
		const newData = Array(this.size[0] * this.size[1]);
		for(const pos of this.Positions)
			newData[this.#PosToIndex(pos)] = this.UpdateAt(pos, dt);
		this.data = newData;
	}

	/** @abstract */
	UpdateAt(pos, dt) {}

	/**
		@abstract
		@returns {number}
	*/
	ValueAt(pos) {}

	/**
		@abstract
		@param {number} v
	*/
	InteractAt(pos, v) {}

	/* Accessors */

	/** @type { [number, number] } */
	size = [1, 1];
	data = [];

	/** @returns {Generator<[number, number]>} */
	get Positions() {
		return function *() {
			for(let y = 0; y < this.size[1]; ++y) {
				for(let x = 0; x < this.size[0]; ++x) {
					yield [x, y];
				}
			}
		}.call(this);
	}

	#PosToIndex([x, y]) {
		return ~~y * this.size[0] + ~~x;
	}

	Get([x, y]) {
		x = ~~Clamp(x, 0, this.size[0] - 1);
		y = ~~Clamp(y, 0, this.size[1] - 1);
		return this.data[this.#PosToIndex([x, y])];
	}

	Set([x, y], val) {
		this.data[this.#PosToIndex([x, y])] = val;
	}
}

/** Makes a value ranged in [-1, 1] closer to the bounaries. */
function MakeExtreme(v, t) {
	if(v < 0)
		return -MakeExtreme(-v, t);
	return Math.pow(v, 1 / t);
}

class WaterHeightField extends CellularAutomata {
	dampCoef = 0.98;
	genScale = 10;
	genSeed = 117;

	constructor(size) {
		super(size);

		this.SetByFn(this.Init.bind(this));
	}

	Init(pos) {
		const v = noise(
			...pos.map((v, i) =>
				v / this.size[i] * this.genScale
			),
			this.genSeed
		) * 2 - 1;
		return [MakeExtreme(v, 2), 0];
	}

	ValueAt(pos) {
		const v = this.Get(pos)[0];
		return Clamp((v + 1) / 2);
	}

	UpdateAt([x, y], dt) {
		const [v, dv] = this.Get([x, y]);

		const avg = [
			[x+1, y+1],
			[x-1, y+1],
			[x+1, y-1],
			[x-1, y-1],
		]
			.map(pos => this.Get(pos)[0])
			.reduce((a, b) => a + b, 0) / 4;

		const ddv = avg - v;

		return [
			v + dv * dt,
			(dv + ddv * dt) * this.dampCoef,
		];
	}

	InteractAt(pos, v) {
		this.Set(pos, [this.Get(pos)[0] + v / 2, 0]);
	}
}

class App {
	/** @type { [number, number] } */
	size = [1, 1];
	scale = 2;
	/** @type {CellularAutomata} */
	ca;
	speed = 5;
	maxUpdateStep = 0.1;

	Init() {
		frameRate(24);
		createCanvas(1, 1);
		this.Resize([40, 40], 10);
	}

	Resize([w, h], s) {
		this.size = [w, h];
		this.scale = s;
		resizeCanvas(w * s, h * s);

		this.ca = new WaterHeightField(this.size);
	}

	Update(dt) {
		const totalUpdateStep = dt * this.speed;
		const updateTime = Math.ceil(totalUpdateStep / this.maxUpdateStep);
		for(let i = 0; i < updateTime; ++i)
			this.ca.Update(totalUpdateStep / updateTime);
	}

	Render() {
		resetMatrix();
		scale(this.scale);
		noStroke();
		for(const pos of this.ca.Positions) {
			push();
			translate(...pos);
			const datum = this.ca.ValueAt(pos);
			const color = Math.floor(Clamp(datum) * 256);
			fill(color);
			rect(0, 0, 1, 1);
			pop();
		}
	}

	Interact(canvasPos, v) {
		const fieldPos = canvasPos.map((x, i) => x * this.ca.size[i]);
		this.ca.InteractAt(fieldPos, v);
	}
}

const app = new App();

function Clamp(x, min = 0, max = 1) {
	return Math.max(Math.min(x, max), min);
}