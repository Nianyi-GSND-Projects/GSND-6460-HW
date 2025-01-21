import { Tilemap, Tile, Vector2 } from "./tilemap.mts";
import * as Tiles from './tiles.mjs';

export type Step = {
	pos: Vector2;
	remainingTypes: { new(): Tile }[];
};

export type Rule<T extends Tile> = {
	type: T;
	match: (tilemap: Tilemap, pos: Vector2) => boolean;
};

export class Wfc {
	readonly tilemap: Tilemap;
	readonly path: Step[] = [];
	readonly ruleset: Rule<any>[];

	constructor(tilemap: Tilemap, ruleset: Rule<any>[]) {
		this.tilemap = tilemap;
		this.ruleset = ruleset;
	}

	get stackSize(): number {
		return this.path.length;
	}

	*Iterate(x: number, y: number): Generator<Step> {
		try {
			for(const step of this.Expore(x, y))
				yield step;
		}
		catch(e) {
			if(e === 'done')
				return;
			throw e;
		}
	}

	MakeStep(x: number, y: number): Step {
		return {
			pos: [x, y],
			remainingTypes: Object.values(Tiles),
		};
	}

	IsNeighborEmpty(x: number, y: number): boolean {
		return this.tilemap.IsValidPos(x, y) && !this.tilemap.At(x, y);
	}

	*Expore(x: number, y: number): Generator<Step> {
		const step = this.MakeStep(x, y);
		this.path.push(step); // Push the step to the stack.

		while(step.remainingTypes.length) {
			// Make the step.
			const type = TakeRandom(step.remainingTypes);
			const tile = new type();
			this.tilemap.Set(tile, x, y);
			yield step;

			// Skip if it doesn't work.
			if(!this.Validate(x, y))
				continue;

			// Check if all tiles are valid.
			if(this.stackSize >= this.tilemap.tileCount)
				throw 'done';

			// Explore new tiles.
			for(const source of TraverseReversed(this.path)) {
				const neighbors = Array.from(this.tilemap.AdjacentOf(...source.pos));
				while(neighbors.length) {
					const neighbor = TakeRandom(neighbors);
					if(!this.IsNeighborEmpty(...neighbor))
						continue;
					for(const subStep of this.Expore(...neighbor))
						yield subStep;
				}
			}
		}

		// All types are tried, no good.
		// We're taking a step back.
		this.tilemap.Set(undefined, x, y); // Reset the tile.
		yield this.path.pop(); // Pop the step from the stack.
	}

	Validate(x: number, y: number): boolean {
		if(!this.ValidateSingle(x, y))
			return false;
		for(const neighbor of this.tilemap.AdjacentOf(x, y)) {
			if(!this.ValidateSingle(...neighbor))
				return false;
		}
		return true;
	}

	ValidateSingle(x: number, y: number): boolean {
		const tile = this.tilemap.At(x, y);
		if(!tile)
			return true;
		for(const rule of this.ruleset) {
			if(!(tile instanceof rule.type))
				continue;
			if(!rule.match(this.tilemap, [x, y]))
				return false;
		}
		return true;
	}
}

// #region Auxiliary functions

function PickRandom<T>(arr: Array<T>): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function TakeRandom<T>(arr: Array<T>): T | undefined {
	const i = PickRandom([...arr.keys()]);
	return arr.splice(i, 1)[0];
}

function LastOf<T>(arr: Array<T>): T | undefined {
	return arr[arr.length - 1];
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

function Remove<T>(arr: Array<T>, val: T) {
	const i = arr.indexOf(val);
	if(i === -1)
		return;
	arr.splice(i, 1);
}

function *TraverseReversed<T>(arr: Array<T>): Generator<T> {
	for(let i = arr.length; i > 0; --i)
		yield arr[i - 1];
}

// #endregion