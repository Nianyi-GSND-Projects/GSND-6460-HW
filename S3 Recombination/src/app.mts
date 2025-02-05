import p5 from './p5.mts';
import { type Vector } from './vector.mts';

type Component = {
	type: 'face' | 'left eye' | 'right eye' | 'mouth';
	name: string;
	url: string;
	pivot: Vector<2>;
	image: p5.Image;
};

function WaitUntil(fn: () => boolean) {
	return new Promise<void>(res => {
		const timerId = setInterval(() => {
			if(!fn())
				return;
			clearInterval(timerId);
			res();
		});
	});
}

function SetupRadioList<T>($list: HTMLElement,
	options: Iterable<T>,
	optionGenerator: (option: T) => DocumentFragment): void {
	const $options = Array.from(options).map(optionGenerator);
	$options[0].querySelector('input[type="radio"]').setAttribute('checked', '');
	$list.append(...$options);
}

const MakeRadioOption = (name: string) => (components: Component | Iterable<Component>) => {
	if(!(Symbol.iterator in components))
		components = [components];
	const component = components[0];

	const $fragment = document.createDocumentFragment();

	const $radio = document.createElement('input');
	$radio.type = 'radio';
	$radio.name = name;
	$radio.value = component.name;
	$radio.id = `${$radio.name}-${$radio.value}`;
	$fragment.append($radio);

	const $label = document.createElement('label');
	$label.setAttribute('for', $radio.id);
	$fragment.append($label);

	for(const component of components) {
		const $img = document.createElement('img');
		$img.src = `component/${component.type}/${component.name}.png`;
		$label.append($img);
	}

	return $fragment;
}

export class App {
	#$settings: HTMLFormElement;
	#ready: boolean = false;
	#invalidated: boolean = true;
	#components: Map<Component['type'], Map<string, Component>> = new Map();

	/* Construction and initialization */
	//#region

	async Initialize() {
		await this.#FetchResources();
		this.#SetupUi();
		this.#ready = true;
	}

	async #FetchResources() {
		const components = await (await fetch('components.json')).json() as Component[];
		for(const component of components) {
			component.url = `component/${component.type}/${component.name}.png`;
			component.image = loadImage(component.url);
			const type = component.type;
			if(!this.#components.has(type))
				this.#components.set(type, new Map());
			this.#components.get(type).set(component.name, component);
		}
	}

	#SetupUi() {
		this.#$settings = document.forms['settings'];
		this.#$settings.addEventListener('change', () => this.#invalidated = true);
		SetupRadioList(this.#$settings['face-shape'],
			this.#components.get('face').values(),
			MakeRadioOption('face-shape'),
		);
		SetupRadioList(this.#$settings['eye-shape'],
			Array.from(this.#components.get('left eye').keys())
				.map(name => ['left eye', 'right eye'].map(type => this.#components.get(type as Component['type']).get(name))),
			MakeRadioOption('eye-shape'),
		);
		SetupRadioList(this.#$settings['mouth-shape'],
			this.#components.get('mouth').values(),
			MakeRadioOption('mouth-shape'),
		);
	}

	//#endregion

	/* Life cycle */
	//#region

	async Start() {
		await WaitUntil(() => this.#ready);
		createCanvas(1, 1);
	}

	StepFrame() {
		if(!this.#ready)
			return;
		if(this.#invalidated) {
			this.Draw();
			this.#invalidated = false;
		}
	}

	//#endregion

	/* Drawing */
	//#region

	GetString(fieldName: string): string {
		return this.#$settings[fieldName].value;
	}
	GetNumber(fieldName: string): number {
		return +this.GetString(fieldName);
	}
	GetShape(collection: Component['type'], fieldName: string): Component {
		return this.#components.get(collection).get(this.#$settings[fieldName].value);
	}

	readonly baseSize = [40, 40] as Vector<2>;
	get scale(): number {
		return this.GetNumber('scale');
	}
	get bgColor(): string {
		return this.GetString('bg-color');
	}
	get faceColor(): string {
		return this.GetString('face-color');
	}
	get faceShape(): Component {
		return this.GetShape('face', 'face-shape');
	}
	get eyeShapes(): [Component, Component] {
		return [this.GetShape('left eye', 'eye-shape'), this.GetShape('right eye', 'eye-shape')];
	}
	get eyeHeight(): number {
		return this.GetNumber('eye-height');
	}
	get eyeSplit(): number {
		return this.GetNumber('eye-split');
	}
	get mouthShape(): Component {
		return this.GetShape('mouth', 'mouth-shape');
	}
	get mouthDrop(): number {
		return this.GetNumber('mouth-drop');
	}

	Draw() {
		// Clear the canvas.
		resizeCanvas(...(this.baseSize.map(v => v * this.scale) as Vector<2>));
		background(this.bgColor);

		// Set up the matrix.
		resetMatrix();
		scale(this.scale, this.scale);
		noSmooth();
		translate(...(this.baseSize.map(v => Math.floor(v / 2)) as Vector<2>));

		// Draw the face.
		// The face shape.
		tint(this.faceColor);
		this.DrawComponent(this.faceShape);
		noTint();

		// Eyes.
		this.DrawComponent(this.eyeShapes[0], [-this.eyeSplit, -this.eyeHeight]);
		this.DrawComponent(this.eyeShapes[1], [+this.eyeSplit, -this.eyeHeight]);

		// Mouth.
		this.DrawComponent(this.mouthShape, [0, 8 + this.mouthDrop]);
	}

	DrawComponent(component: Component, pos: Vector<2> = [0, 0]) {
		image(component.image, ...(pos.map((v, i) => v - component.pivot[i]) as Vector<2>));
	}

	//#endregion
}

export default App;