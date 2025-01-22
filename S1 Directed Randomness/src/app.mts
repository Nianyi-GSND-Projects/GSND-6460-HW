import { Tilemap, Vector2 } from './tilemap.mjs';
import { Wfc, type Rule } from './wfc.mts';

export class App {
	/* Fields */

	tilemap: Tilemap = new Tilemap();
	ruleset: Rule<any>[] = [];
	iterator: Generator = null;

	/* Life cycle */

	Initialize() {
		this.FillEmpty();
	}

	Step() {
		if(!this.iterator)
			return;
		const { done } = this.iterator.next();
		if(done)
			this.iterator = null;
	}

	Scroll(offset: Vector2) {
		const pairs = Array.from(this.tilemap.Positions)
			.map(pos => ({
				pos,
				tile: this.tilemap.At(pos.map((v, i) => v + offset[i]) as Vector2),
			}));

		for(const { pos, tile } of pairs)
			this.tilemap.Set(tile, pos);

		this.FillEmpty();
	}

	FillEmpty() {
		this.iterator = this.#Wfc();
	}

	/* Functions */

	*#Wfc() {
		const wfc = new Wfc(this);

		yield;

		for(const _ of wfc.Iterate()) {
			this.tilemap.Update();
			this.tilemap.Render();

			yield;
		}
	}
}

export default App;