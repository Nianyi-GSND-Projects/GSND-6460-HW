import { type ShapeTree } from './formal-grammar.mts';

export interface Ruleset {
	readonly name: string;
	get tree(): ShapeTree;
	CreateTree(): ShapeTree;
	SetupSettings($form: HTMLFormElement): void;
	AutoGrow(): Generator;
};

export default Ruleset;


import lSystem from './rulesets/l-system.mts';
export const rulesets: Ruleset[] = [lSystem];