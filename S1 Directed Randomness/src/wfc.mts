import type App from './app.mts';
import { Tilemap, Tile, Vector2 } from './tilemap.mts';
import * as Tiles from './tiles.mts';
const tileTypes = Object.values(Tiles);

export type Step = {
	pos: Vector2;
};

export type Rule<T extends Tile> = {
	type: T;
	match: (tilemap: Tilemap, pos: Vector2) => boolean;
};

/**
 * @summary An instance of the Wave-function Collapse algorithm.
 * @see https://en.wikipedia.org/wiki/Model_synthesis
*/
export class Wfc {
	readonly app: App;
	/** All the tiles that needs to be resolved by this instance. */
	targetTiles: Vector2[];
	/** The tiles that hasn't been resolved in the current try. */
	remainingTiles: Vector2[];

	get tilemap(): Tilemap {
		return this.app.tilemap;
	}
	get ruleset(): Rule<any>[] {
		return this.app.ruleset;
	}

	constructor(app: App) {
		this.app = app;
		this.targetTiles = Array.from(this.tilemap.Positions)
			.filter(pos => !this.tilemap.At(pos));
	}

	/** The core loop of the WFC algorithm. */
	*Iterate(): Generator<Vector2> {
		// Keep trying until it succeed.
		while(true) {
			// Make a copy of all target tiles.
			this.remainingTiles = this.targetTiles.slice();

			// Perform one round of generation.
			let bad = false;
			while(this.remainingTiles.length) {
				try {
					yield this.PerformGeneration();
				}
				catch(e) {
					if(e !== 'bad')
						throw e;
					// Set up a flag if it gone bad.
					// It'd be easier if JavaScript supports named blocks.
					bad = true;
					break;
				}
			}
			// If generation is bad, reset and try again.
			if(bad) {
				for(const pos of this.targetTiles)
					this.tilemap.Set(undefined, pos);
				continue;
			}

			// Suceed. Exiting.
			return;
		}
	}

	/**
	 * Decide the type of a tile with minimal possibilities.
	 * i.e. the atomic operation in the WFC algorithm.
	 * Failed if 'bad' was thrown.
	 */
	PerformGeneration(): Vector2 {
		const candidates = this.remainingTiles.map((pos, i) => {
			const types = tileTypes.filter(type => this.Validate(type, pos));
			return { pos, validTypes: types, i };
		});

		// Choose a tile with the minimum possibilities,
		// i.e. the essense of the WFC algorithm.
		Shuffle(candidates);
		candidates.sort((a, b) => a.validTypes.length - b.validTypes.length);
		const candidate = candidates[0];

		// We run into a dead-end.
		if(candidate.validTypes.length === 0)
			throw 'bad';

		// Assign a tile for the candidate with a random valid type.
		const type = PickRandom(candidate.validTypes);
		this.tilemap.Set(new type(), candidate.pos);
		// Don't forget to remove it from the remaining tiles.
		this.remainingTiles.splice(candidate.i, 1);
		return candidate.pos;
	}

	/** See if assigning the specified type to the specified position would be valid. */
	Validate(type: { new(): Tile }, pos: Vector2): boolean {
		for(const rule of this.ruleset) {
			if(type !== rule.type)
				continue;
			if(!rule.match(this.tilemap, pos))
				return false;
		}
		return true;
	}
}

// #region Auxiliary functions

function PickRandom<T>(arr: Array<T>): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @see https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/2450976#2450976
 */
function Shuffle<T>(arr: Array<T>) {
	let currentIndex = arr.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[arr[currentIndex], arr[randomIndex]] = [
			arr[randomIndex], arr[currentIndex]];
	}
}
// #endregion