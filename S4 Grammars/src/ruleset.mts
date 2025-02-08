import { type ShapeTree } from './formal-grammar.mts';

export interface Ruleset {
	readonly name: string;
	get tree(): ShapeTree;
	CreateNewTree(): ShapeTree;
	SetupUi($form: HTMLFormElement): void;
	AutoGrow(): Generator;
	Draw(): void;
};

export default Ruleset;


import lSystem from './rulesets/l-system.mts';
export const rulesets: Ruleset[] = [lSystem];