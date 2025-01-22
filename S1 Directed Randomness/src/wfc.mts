import { Tilemap, Tile, Vector2 } from "./tilemap.mts";
import * as Tiles from './tiles.mjs';

export type Step = {
	pos: Vector2;
	remainingTypes: { new(): Tile }[];
	remainingNeighbors: Vector2[];
};

export type Rule<T extends Tile> = {
	type: T;
	match: (tilemap: Tilemap, pos: Vector2) => boolean;
};

export class Wfc {
	readonly tilemap: Tilemap;
	readonly path: Step[] = [];
	readonly ruleset: Rule<any>[];
	temperature: number = 0;

	constructor(tilemap: Tilemap, ruleset: Rule<any>[]) {
		this.tilemap = tilemap;
		this.ruleset = ruleset;
	}

	get stackSize(): number {
		return this.path.length;
	}

	*Iterate(pos: Vector2): Generator<Step> {
		try {
			for(const step of this.Explore(pos))
				yield step;
		}
		catch(e) {
			if(e === 'done')
				return;
			throw e;
		}
	}

	MakeStep(pos: Vector2): Step {
		return {
			pos,
			remainingTypes: Object.values(Tiles),
			remainingNeighbors: Array.from(this.tilemap.NeighborsOf(pos)).filter(pos => this.IsNeighborEmpty(pos)),
		};
	}

	IsNeighborEmpty(pos: Vector2): boolean {
		return this.tilemap.IsValidPos(pos) && !this.tilemap.At(pos);
	}

	*Explore(pos: Vector2): Generator<Step> {
		const step = this.MakeStep(pos);
		this.path.push(step); // Push the step to the stack.

		while(step.remainingTypes.length) {
			// Make the step.
			const type = TakeRandom(step.remainingTypes);
			const tile = new type();
			this.tilemap.Set(tile, pos);
			yield step;

			// Skip if it doesn't work.
			if(!this.Validate(pos)) {
				this.temperature += 1;
				continue;
			}
			this.temperature /= 2;
			this.temperature = Math.max(0, this.temperature);

			// Check if all tiles are valid.
			if(this.stackSize >= this.tilemap.tileCount)
				throw 'done';

			// Explore new tiles.

			// Start from neighbors for performance.
			while(step.remainingNeighbors.length) {
				const neighbor = TakeRandom(step.remainingNeighbors);
				// if(!this.IsNeighborEmpty(...neighbor))
				// 	continue;
				for(const subStep of this.Explore(neighbor))
					yield subStep;
			}

			// Then pick wild empty tiles.
			const candidates = Array.from(this.tilemap.Positions)
				.filter(pos => this.tilemap.At(pos) === undefined);

			Shuffle(candidates); // Heuristic.
			candidates.splice(3, candidates.length);

			// TODO: Remove tested neighbors from the candidates.
			while(candidates.length) {
				const neighbor = TakeRandom(candidates);
				// if(!this.IsNeighborEmpty(...neighbor))
				// 	continue;
				for(const subStep of this.Explore(neighbor))
					yield subStep;
			}
		}

		// All types are tried, no good, take steps back.
		// The amount of the step is decided by the temperature.
		const stepbackCount = Math.min(
			this.stackSize - 1,
			Math.floor(Math.exp(Math.random() * this.temperature * 0.1)),
		);
		for(let i = 0; i < stepbackCount; ++i) {
			const stepback = this.path.pop();
			this.tilemap.Set(undefined, stepback.pos); // Reset the tile.
			yield stepback; // Pop the step from the stack.
		}
	}

	Validate(pos: Vector2): boolean {
		if(!this.ValidateSingle(pos))
			return false;
		return true;
	}

	ValidateSingle(pos: Vector2): boolean {
		const tile = this.tilemap.At(pos);
		if(!tile)
			return true;
		for(const rule of this.ruleset) {
			if(!(tile instanceof rule.type))
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

function TakeRandom<T>(arr: Array<T>): T | undefined {
	const i = PickRandom([...arr.keys()]);
	return arr.splice(i, 1)[0];
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