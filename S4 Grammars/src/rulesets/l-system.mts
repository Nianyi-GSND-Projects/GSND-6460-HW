import type Ruleset from '../ruleset.mts';
import { ShapeTree, Node } from '../formal-grammar.mts';
import * as NE from '@nianyi-wang/element';
import '../p5.mts';
import { CreateInputEx } from '../utils.mts';

class LSystemRuleset implements Ruleset {
	readonly name = 'L-system';

	// Settings
	rule: string = 'f[++F][-ffF][----F]';
	angle: number = 10;
	length: number = 7;
	depth: number = 4;
	attenuation: number = 0.5;

	$sentence: HTMLElement;

	#tree: ShapeTree;
	get tree(): ShapeTree {
		return this.#tree;
	}

	CreateNewTree() {
		return this.#tree = new LSystem();
	};

	SetupUi($form: HTMLFormElement) {
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
				this.$sentence = NE.Create('p'),
			],
		});
	};

	AutoGrow(): Generator {
		if(!this.tree)
			return null;
		return this.tree.root.Grow(this.depth);
	}

	Draw(): void {
		this.tree.Draw();
		lSystemRuleset.$sentence.innerText = Array.from(this.#tree.root.leaves)
			.map(node => (node as LSystemNode).type)
			.join('');
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
		angleMode(DEGREES);
		translate(width / 2, height);
		scale(1, -1);
		scale(lSystemRuleset.length);
		strokeWeight(1.0 / lSystemRuleset.length);
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
		return lSystemRuleset.length * Math.pow(lSystemRuleset.attenuation, this.level);
	}

	constructor(parent: LSystemNode = null, type: string = 'F') {
		super();

		this.parent = parent;
		this.type = type;
	}

	protected override *GrowOnce(): Iterable<Node> {
		if(this.type !== 'F')
			return;
		this.type = 'f';

		for(const type of lSystemRuleset.rule) {
			yield new LSystemNode(this, type);
		}
	}

	override Draw(): void {
		switch(this.type) {
			case 'F':
				break;
			case 'f':
				translate(0, this.length);
				line(0, -this.length, 0, 0);
				break;
			case '+':
				rotate(+lSystemRuleset.angle);
				break;
			case '-':
				rotate(-lSystemRuleset.angle);
				break;
			case '[':
				push();
				break;
			case ']':
				pop();
				break;
			default:
				throw new EvalError(`"${this.type}" is not a recognizable instruction.`);
		}
		if(this.children) {
			for(const child of this.children)
				child.Draw();
		}
	}
}