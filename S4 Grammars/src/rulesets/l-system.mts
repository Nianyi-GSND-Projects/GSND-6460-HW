import type Ruleset from '../ruleset.mts';
import { ShapeTree, Node } from '../formal-grammar.mts';
import * as NE from '@nianyi-wang/element';
import '../p5.mts';
import { CreateInputEx } from '../utils.mts';

class LSystemRuleset implements Ruleset {
	readonly name = 'L-system';
	rule: string = 'F+F-';
	angle: number = 10;
	length: number = 10;
	depth: number = 4;
	attenuation: number = 1;

	#tree: ShapeTree;
	get tree(): ShapeTree {
		return this.#tree;
	}

	CreateTree() {
		return this.#tree = new LSystem();
	};

	SetupSettings($form: HTMLFormElement) {
		NE.Modify($form, {
			children: [
				CreateInputEx('Rule', this, 'rule', 'string'),
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
			],
		});
	};

	AutoGrow(): Generator {
		if(!this.tree)
			return null;
		return this.tree.root.Grow(this.depth);
	}
}

const lSystemRuleset = new LSystemRuleset();
export default lSystemRuleset;

class LSystem extends ShapeTree {
	override readonly exhaustable: boolean = false;
	override readonly desiredSize: [number, number] = [400, 400];

	constructor() {
		super(new LSystemNode());
	}

	protected override BeginDrawing(): void {
		translate(width / 2, height);
		scale(1, -1);
		scale(lSystemRuleset.length);
		strokeWeight(1.0 / lSystemRuleset.length);
	}
}

class LSystemNode extends Node {
	readonly parent: LSystemNode;
	readonly turns: number;

	get level(): number {
		if(!this.parent)
			return 0;
		return this.parent.level + 1;
	}

	get length(): number {
		return lSystemRuleset.length * Math.pow(lSystemRuleset.attenuation, this.level);
	}

	constructor(parent: LSystemNode = null, turns: number = 0) {
		super(false);

		this.parent = parent;
		this.turns = turns;
	}

	protected *GrowOnce(): Iterable<Node> {
		yield new LSystemNode(this, -1);
		yield new LSystemNode(this, 1);
	}

	Enter(): void {
		push();
		angleMode(DEGREES);
		rotate(lSystemRuleset.angle * this.turns);
		translate(0, this.length);
	}
	Exit(): void {
		pop();
	}
	Draw(): void {
		line(0, -this.length, 0, 0);
	}
}