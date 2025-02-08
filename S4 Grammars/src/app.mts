import './p5.mts';
import { type Ruleset, rulesets } from './ruleset.mts';
import { WaitUntil } from './utils.mts';
import * as NE from '@nianyi-wang/element';

export class App {
	/* Settings */
	//#region

	#$systems: HTMLFormElement;
	#$settings: HTMLFormElement;

	//#endregion

	/* Formal grammar */
	//#region

	ruleset: Ruleset = null;

	//#endregion

	/* Life cycle */
	//#region

	#ready: boolean = false;
	#invalidated: boolean = true;

	async Initialize() {
		this.#SetupUi();
		this.#ready = true;
	}

	static readonly #systemNameFormKey = 'system-name';
	#SetupUi() {
		this.#$systems = document.forms['systems'];
		NE.Modify(this.#$systems, {
			children: rulesets.map(ruleset => NE.Create('span', {
				children: [
					NE.Create('span', { text: `${ruleset.name}: ` }),
					NE.Create('input', {
						attributes: {
							type: 'radio',
							name: App.#systemNameFormKey,
							value: ruleset.name,
						},
					}),
				],
			})),
		});
		this.#$systems.addEventListener('input', () => {
			const name: string = this.#$systems[App.#systemNameFormKey].value;
			this.ruleset = rulesets.find(ruleset => ruleset.name === name);

			NE.Clear(this.#$settings);
			this.ruleset.SetupSettings(this.#$settings);
			this.ruleset.CreateTree();
			this.ScheduleRedraw();
		});

		this.#$settings = document.forms['settings'];
		this.#$settings.addEventListener('input', () => this.ScheduleRedraw());
	}

	async Start() {
		await WaitUntil(() => this.#ready);
		createCanvas(1, 1);
		// this.#$systems.querySelector(`input[name=${App.#systemNameFormKey}]`).setAttribute('checked', '');
	}

	StepFrame() {
		if(!this.#ready)
			return;
		if(this.#invalidated)
			this.#invalidated = this.Draw();
	}

	//#endregion

	/* Drawing */
	//#region

	#growingCoroutine: Generator = null;

	ScheduleRedraw() {
		this.#growingCoroutine = this.ruleset.AutoGrow();
		this.#invalidated = true;
	}

	Draw(): boolean {
		if(!this.#growingCoroutine)
			return false;

		resizeCanvas(...this.ruleset.tree.desiredSize);
		clear();
		background(255);
		resetMatrix();

		this.ruleset.tree.Draw();

		const { done } = this.#growingCoroutine.next();
		return !done;
	}

	//#endregion
}

export default App;