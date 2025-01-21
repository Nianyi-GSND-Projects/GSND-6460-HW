import { Tilemap, Tile, Vector2 } from './tilemap.mjs';
import * as Tiles from './tiles.mjs';
import { Wfc, type Step, type Rule } from './wfc.mts';

export class App {
	tilemap: Tilemap;
	finished: boolean;
	iterator: Generator;
	wfc: Wfc;
	ruleset: Rule<any>[];

	/* Life cycle */

	Initialize() {
		this.tilemap = new Tilemap();
		this.finished = false;
		this.iterator = this.IterateCoroutine();
		this.wfc = new Wfc(this.tilemap, this.ruleset);
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
			const updateTargets = [pos, ...this.tilemap.AdjacentOf(...pos)];
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