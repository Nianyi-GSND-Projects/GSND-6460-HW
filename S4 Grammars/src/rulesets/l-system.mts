import type Ruleset from '../ruleset.mts';
import { ShapeTree, Node } from '../formal-grammar.mts';
import * as NE from '@nianyi-wang/element';
import '../p5.mts';
import { CreateInputEx } from '../utils.mts';

type LSystemSettings = {
	name?: string;
	seed: string;
	rules: [string, string][];
	angle: number;
	length: number;
	depth: number;
	attenuation: number;
	startingX: number;
	startingY: number;
}

const presets: LSystemSettings[] = [
	{
		name: 'Tree',
		seed: 'F',
		rules: [
			['F', 'f[++F][-ffF][----F]']
		],
		angle: 10,
		length: 7,
		depth: 4,
		attenuation: 0.7,
		startingX: 0.5,
		startingY: 0.0,
	},
	{
		name: 'Dragon Curve',
		seed: 'X',
		rules: [
			['X','X+YF+'],
			['Y','-FX-Y'],
		],
		angle: 90,
		length: 2,
		depth: 8,
		attenuation: 1,
		startingX: 0.5,
		startingY: 0.5,
	},
];

class LSystemRuleset implements Ruleset<LSystemSettings> {
	readonly name = 'L-system';

	// Settings
	settings: LSystemSettings = presets[0];

	$sentence: HTMLElement;
	onChangedInternally: Function[] = [];

	#tree: ShapeTree;
	get tree(): ShapeTree {
		return this.#tree;
	}

	CreateNewTree() {
		return this.#tree = new LSystem();
	};

	ApplyPreset(preset: LSystemSettings): void {
		if(!preset) {
			console.warn('Preset is null.');
			return;
		}

		this.settings = preset;
		this.#TriggerOnChangedInternally();
	}

	SetupUi($form: HTMLFormElement) {
		NE.Modify($form, {
			children: [
				NE.Create('p', {
					children: [
						NE.Create('span', { text: 'Presets: ' }),
						...presets.map(preset => NE.Create('button', {
							text: preset.name,
							attributes: {
								type: 'button',
								'data-preset-name': preset.name
							},
							on: {
								click: ev => {
									const preset = presets.find(p => p.name === (ev.target as Element).getAttribute('data-preset-name'));
									this.ApplyPreset(preset);
								},
							},
						})),
					],
				}),
				NE.Create('p', {
					children: [
						NE.Create('span', { text: 'Rules: '}),
						NE.Create('input', {
							attributes: {
								value: this.settings.rules.map(r => r.join('>')).join(';'),
								type: 'text',
							},
							on: {
								change: ev => {
									const value = (ev.target as HTMLInputElement).value;
									this.settings.rules = value.split(';').map(r => r.split('>') as [string, string]);
								}
							}
						}),
					],
				}),
				CreateInputEx('Seed', this, 'seed', 'string'),
				CreateInputEx('Depth', this, 'depth', 'number', {
					min: 0, max: 10, step: 1,
				}),
				CreateInputEx('Angle', this, 'angle', 'number', {
					min: 0, max: 90, step: 1,
				}),
				CreateInputEx('Length', this, 'length', 'number', {
					min: 1, max: 100, step: 1,
				}),
				CreateInputEx('Attenuation', this, 'attenuation', 'number', {
					min: 0, max: 1, step: 0.01,
				}),
				CreateInputEx('Starting X', this, 'startingX', 'number', {
					min: 0, max: 1, step: 0.01,
				}),
				CreateInputEx('Starting Y', this, 'startingY', 'number', {
					min: 0, max: 1, step: 0.01,
				}),
				NE.Create('p', {
					children: [
						NE.Create('span', { text: 'Generated sentence: ' }),
						this.$sentence = NE.Create('code'),
					],
				}),
			],
		});
	};

	AutoGrow(): Generator {
		if(!this.tree)
			return null;
		return this.tree.root.Grow(this.settings.depth);
	}

	Draw(): void {
		this.tree.Draw();
		lSystemRuleset.$sentence.innerText = Array.from(this.#tree.root.leaves)
			.map(node => (node as LSystemNode).type)
			.join('');
	}

	#TriggerOnChangedInternally() {
		for(const fn of this.onChangedInternally)
			fn?.();
	}
}

const lSystemRuleset = new LSystemRuleset();
export default lSystemRuleset;

class LSystem extends ShapeTree {
	override readonly exhaustable: boolean = false;
	override readonly desiredSize: [number, number] = [400, 400];

	constructor() {
		super(new LSystemNode(null, lSystemRuleset.settings.seed));
	}

	protected override BeginDrawing(): void {
		angleMode(DEGREES);
		translate(lSystemRuleset.settings.startingX * width, (1 - lSystemRuleset.settings.startingY) * height);
		scale(1, -1);
		scale(lSystemRuleset.settings.length);
		strokeWeight(1.0 / lSystemRuleset.settings.length);
	}
}

class LSystemNode extends Node {
	readonly parent: LSystemNode;
	type: string;

	get level(): number {
		if(!this.parent)
			return 0;
		return this.parent.level + 1;
	}

	get length(): number {
		return lSystemRuleset.settings.length * Math.pow(lSystemRuleset.settings.attenuation, this.level);
	}

	constructor(parent: LSystemNode = null, type: string = 'F') {
		super();

		this.parent = parent;
		this.type = type;
	}

	protected override *GrowOnce(): Iterable<Node> {
		const rules = lSystemRuleset.settings.rules;
		const applicableRules = rules.filter(r => r[0] === this.type);
		if(!applicableRules.length)
			return;
		const rule = applicableRules[Math.floor(Math.random() * applicableRules.length)][1];
		for(const type of rule) {
			yield new LSystemNode(this, type);
		}
	}

	override Draw(): void {
		switch(this.type) {
			case 'F':
			case 'f':
				translate(0, this.length);
				line(0, -this.length, 0, 0);
				break;
			case '+':
				rotate(+lSystemRuleset.settings.angle);
				break;
			case '-':
				rotate(-lSystemRuleset.settings.angle);
				break;
			case '[':
				push();
				break;
			case ']':
				pop();
				break;
			default:
				break;
		}
		if(this.children) {
			for(const child of this.children)
				child.Draw();
		}
	}
}