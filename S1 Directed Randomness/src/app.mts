import { Tilemap, Vector2 } from './tilemap.mjs';
import { Wfc, type Rule } from './wfc.mts';
import { EventEmitter } from 'events';

export class App extends EventEmitter {
	/* Fields */

	tilemap: Tilemap = new Tilemap();
	ruleset: Rule<any>[] = [];
	wfc: Wfc;
	finished: boolean;
	iterator: Generator;
	iteration: number;

	/* Life cycle */

	Initialize() {
		this.ResetWfc();
	}

	Step() {
		if(this.finished)
			return;
		this.finished = this.iterator.next().done !== false;
		++this.iteration;
		this.emit('iterate', this.iteration);
		if(this.finished)
			this.emit('done');
	}

	*IterateCoroutine() {
		const startingPos = Array(2).fill(0).map(
			(_, i) => Math.floor(Math.random() * this.tilemap.size[i])
		) as Vector2;

		for(const step of this.wfc.Iterate(startingPos)) {
			const pos = step.pos;

			this.tilemap.SetupTransform();
			const updateTargets = [pos, ...this.tilemap.NeighborsOf(pos, true)];
			for(const target of updateTargets) {
				this.tilemap.UpdateAt(target);
				this.tilemap.RenderAt(target);
			}

			const tile = this.tilemap.At(pos);
			console.log([
				`Stack size: ${this.wfc.stackSize}`,
				`${tile?.constructor?.name}@(${pos})`,
				`${this.wfc.Validate(pos) ? 'succeed' : 'failed'}`
			].join(' '));


			yield;
		}

		this.finished = true;
	}

	ResetWfc() {
		for(const pos of this.tilemap.Positions)
			this.tilemap.Set(undefined, pos);
		this.wfc = new Wfc(this.tilemap, this.ruleset);
		this.finished = false;
		this.iterator = this.IterateCoroutine();
		this.iteration = 0;
	}
}

export default App;