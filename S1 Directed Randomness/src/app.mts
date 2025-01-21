import { Tilemap, Vector2 } from './tilemap.mjs';
import { Wfc, type Rule } from './wfc.mts';

export class App {
	tilemap: Tilemap = new Tilemap();
	finished: boolean;
	iterator: Generator;
	ruleset: Rule<any>[] = [];
	wfc: Wfc = new Wfc(this.tilemap, this.ruleset);

	/* Life cycle */

	Initialize() {
		this.finished = false;
		this.iterator = this.IterateCoroutine();
	}

	Step() {
		if(this.finished)
			return;
		this.finished = this.iterator.next().done !== false;
	}

	*IterateCoroutine() {
		const startingPos = Array(2).fill(0).map(
			(_, i) => Math.floor(Math.random() * this.tilemap.size[i])
		) as Vector2;

		for(const step of this.wfc.Iterate(...startingPos)) {
			const pos = step.pos;

			this.tilemap.SetupTransform();
			const updateTargets = [pos, ...this.tilemap.AdjacentOf(...pos, true)];
			for(const target of updateTargets) {
				this.tilemap.UpdateAt(...target);
				this.tilemap.RenderAt(...target);
			}

			const tile = this.tilemap.At(...pos);
			console.log([
				`Stack size: ${this.wfc.stackSize}`,
				`${tile?.constructor?.name}@(${pos})`,
				`${this.wfc.Validate(...pos) ? 'succeed' : 'failed'}`
			].join(' '));


			yield;
		}

		this.finished = true;
	}
}

export default App;