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

class Field {
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

class WaterHeightField extends Field {
	dampCoef = 0.98;
	genScale = 10;
	genSeed = 117;

	constructor(size) {
		super(size);

		this.SetByFn(this.#Init.bind(this));
	}

	#Init(pos) {
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

class CellularAutomata extends Field {
	constructor(size) {
		super(size);
		this.SetByFn(() => Math.random() > 0.5);
	}

	ValueAt(pos) {
		return 1 - this.Get(pos);
	}

	#accDt = 0;
	/** @override */
	Update(dt) {
		for(this.#accDt += dt; this.#accDt > 1; --this.#accDt) {
			this.#UpdateOnce(1);
		}
	}

	#UpdateOnce(dt) {
		Field.prototype.Update.call(this, dt);
	}

	UpdateAt([x, y]) {
		const self = this.Get([x, y]);

		let count = 0;
		for(let dx = -1; dx <= 1; ++dx) {
			for(let dy = -1; dy <= 1; ++dy) {
				count += this.Get([x + dx, y + dy]);
			}
		}
		count -= self;

		if(count == 2)
			return self;
		if(count == 3)
			return 1;
		return 0;
	}

	InteractAt(pos, v) {
		this.Set(pos, 1 - this.Get(pos));
	}
}

class App {
	/** @type { [number, number] } */
	size = [1, 1];
	scale = 2;
	/** @type {Field} */
	field;
	fieldType = CellularAutomata;
	speed = 5;
	maxUpdateStep = 0.1;

	Init() {
		frameRate(24);
		createCanvas(1, 1);
		this.Resize([40, 40], 10);

		document.forms['settings'].addEventListener('change', ev => {
			const value = ev.target.value;
			switch(ev.target.name) {
				case 'field-type':
					this.ReapplyFieldType(eval(value));
					break;
			}
		});
	}

	Resize([w, h], s) {
		this.size = [w, h];
		this.scale = s;
		resizeCanvas(w * s, h * s);

		this.ReapplyFieldType();
	}

	ReapplyFieldType(fieldType) {
		if(fieldType === undefined) {
			fieldType = this.fieldType;
		}
		if(typeof fieldType === 'string') {
			console.log(fieldType);
		}
		this.field = new fieldType(this.size);
	}

	Update(dt) {
		const totalUpdateStep = dt * this.speed;
		const updateTime = Math.ceil(totalUpdateStep / this.maxUpdateStep);
		for(let i = 0; i < updateTime; ++i)
			this.field.Update(totalUpdateStep / updateTime);
	}

	Render() {
		resetMatrix();
		scale(this.scale);
		noStroke();
		for(const pos of this.field.Positions) {
			push();
			translate(...pos);
			const datum = this.field.ValueAt(pos);
			const color = Math.floor(Clamp(datum) * 256);
			fill(color);
			rect(0, 0, 1, 1);
			pop();
		}
	}

	Interact(canvasPos, v) {
		const fieldPos = canvasPos.map((x, i) => x * this.field.size[i]);
		this.field.InteractAt(fieldPos, v);
	}
}

const app = new App();

function Clamp(x, min = 0, max = 1) {
	return Math.max(Math.min(x, max), min);
}