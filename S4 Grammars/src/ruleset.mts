import { type ShapeTree } from './formal-grammar.mts';

export interface Ruleset<Settings> {
	settings: Settings;
	readonly name: string;
	get tree(): ShapeTree;
	onChangedInternally: Function[];
	CreateNewTree(): ShapeTree;
	SetupUi($form: HTMLFormElement): void;
	AutoGrow(): Generator;
	Draw(): void;
};

export default Ruleset;


import lSystem from './rulesets/l-system.mts';
export const rulesets: Ruleset<any>[] = [lSystem];