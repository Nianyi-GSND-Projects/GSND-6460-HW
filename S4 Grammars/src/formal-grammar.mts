export abstract class ShapeTree {
	readonly #root: Node;
	get root(): Node {
		return this.#root;
	}

	abstract readonly exhaustable: boolean;

	abstract get desiredSize(): [number, number];

	constructor(root: Node) {
		this.#root = root;
	}

	protected abstract BeginDrawing(): void;
	Draw(): void {
		this.BeginDrawing();
		this.#root.Draw();
	}
}

export abstract class Node {
	/* Construction and hierarchy */
	//#region

	#children: Node[] = null;
	get children(): Iterable<Node> {
		return this.#children?.values() ?? [];
	}

	get leaves(): Iterable<Node> {
		if(!this.#children || !this.#children.length)
			return [this];
		const self = this;
		return function *() {
			for(const child of self.children) {
				for(const node of child.leaves)
					yield node;
			}
		}();
	}

	//#endregion
	
	/* Growing */
	//#region

	protected abstract GrowOnce(): Iterable<Node>;

	*Grow(layerCount: number): Generator<Node> {
		if(layerCount <= 0)
			return;
		this.#children = [];
		for(const child of this.GrowOnce()) {
			this.#children.push(child);
			yield child;
		}
		for(const child of this.children) {
			for(const node of child.Grow(layerCount - 1))
				yield node;
		}
	}

	*GrowLeaves(layerCount: number = 1): Generator<Node> {
		for(const leaf of this.leaves) {
			for(const node of leaf.Grow(layerCount))
				yield node;
		}
	}

	//#endregion

	/* Drawing */
	//#region

	abstract Draw(): void;

	//#endregion
}