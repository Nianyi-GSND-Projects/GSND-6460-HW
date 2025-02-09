<p style="text-align: center; font-weight: bold;">
Content warning: It'll take a long time for one image to be fully rendered.
</p>

## Links

- [p5.js sketch](https://editor.p5js.org/WangNianyi2001/sketches/ImorBCiYu)
- [Source _TypeScript_ project on _GitHub_](https://github.com/Nianyi-GSND-Projects/GSND-6460-HW/tree/master/S4%20Grammars)

## Attribution

- No external assistance is used to create the base program.
- The generation grammars for the fractal plant and the classic fractal shapes are sampled from [_Wikipedia_](https://en.wikipedia.org/wiki/L-system).
- The code in the sketch page is bundled from a _TypeScript_ source project. To see the raw project, go to [_GitHub_](https://github.com/Nianyi-GSND-Projects/GSND-6460-HW/tree/master/S4%20Grammars).
- A lightweight toolkit written by myself a couple of years ago (NPM name: `@nianyi-wang/element`) is used to make it easier to create and modify HTML elements. It's not related to the L-system's core algorithm, it only helps display the settings panel.

## Design recipe

### 1. Intention

Create a test field for the L-system to let users fiddle around with it.
The user should be able to adjust the parameters and the results would be produced interactively.

### 2. State types

It's unnecessary to introduce all the details as the major portion of the code is dealing with the UI and the life cycle of when to draw/step/etc.
I'll just pick the most important part here.

The core algorithm simulates the growing (or deducing) process of a L-system, that is, keep replacing the non-terminal tokens in a string by a given ruleset.
To achieve this, I implemented an AST (abstract syntax tree) to represent every token with a node.
With this, I could control the depth of the expansion I want to halt before it goes on infinitely (as we know, L-systems usually lack of terminal tokens).

Then there are the fields in the settings panel.
Let me explain each of them with a list:

- `rules: string`, the grammar rules. Use `>` for `:=` and `;` for separation. White-spaces are not allowed.
- `seed: string`, the axiom. Only one letter is allowed.
- `depth: number`, the maximum iteration depth of the deduction/growing process.
- `angle: number`, the added angle (in degree) for each branching.
- `length: number`, the base length of an `F`.
- `attenuation: number`, the factor that's multiplied on the length with every layer of depth. The smaller this value is, the "balder" the shape would be.
- `startingAngle: number`, the initial direction the first branch is facing.
- `startingX/Y: number`: the initial position the first branch is originated from, in relative portion to the canvas width/height.

There also are the presets, which has a type definition as:
```typescript
type LSystemSettings = {
	name?: string;
	seed: string;
	rules: [string, string][];
	angle: number;
	length: number;
	depth: number;
	attenuation: number;
	startingAngle: number;
	startingX: number;
	startingY: number;
}
```

Lastly, the ruleset type definition for different kinds of grammar systems (see the postscript), which is not used (more than one time) in this sketch, but for the sake of completeness I'll just put it here:
```typescript
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
```

### 3. Required library functions

Really not many for this time. Just the resetting functions (`resetMatrix`, `clear`, `background`), stroking functions (`strokeWeight`, `line`) and classic matrix operations (`scale`, `translate`, `rotate`).
Most of the works are not about drawing.

### 4. Instructions

1. Open the sketch page, it shall automatically start drawing a "trident tree".
	If it doesn't, select the radio bullet on the right of "L-system" and click on a preset button to start drawing a shape.

2. Click on other preset buttons to see different pre-configured shapes.

3. Adjust the fields in the settings UI and see what you could create!

## Gallery

<div style="text-align: center;">

<img src="https://piazza.com//redirect/s3?bucket=uploads&amp;prefix=paste%2Fm5oaxth0ok5aa%2F6a52bc58663c72beeb95036bd13496b88e136b59728f410edaaa85b51f0e6199%2Fl-system-ui-panel.png" width="300" />

The UI panel showing every tweakable fields.
The rules in the image produces a trident-like tree (see the next image).

<img src="https://piazza.com//redirect/s3?bucket=uploads&prefix=paste%2Fm5oaxth0ok5aa%2F46716e709bf4b63945b70f079e85aa9236cbfd2b6a8ac6534f1daf20c1c6ee46%2Ftrident-tree.png" alt="trident-tree.png" width="300" />

A "trident tree" produced with the rule `F := f[++F][-ffF][----F]`.

<img src="https://piazza.com//redirect/s3?bucket=uploads&prefix=paste%2Fm5oaxth0ok5aa%2F6e5470473c9605bfb0d3f6000b0399b25426e7731c51a890830d1e88706c5ade%2Ffractal-plant.png" alt="fractal-plant.png" width="300" />
<img src="https://piazza.com//redirect/s3?bucket=uploads&prefix=paste%2Fm5oaxth0ok5aa%2Fa1e3402cf8735ffea58d15559f5e5d1ff756ac6d0c519801441aed53413b06a1%2Ffractal-plant-sentence.png" alt="fractal-plant-sentence.png" width="300" />

A fractal plant ([Barnsley fern](https://en.wikipedia.org/wiki/Barnsley_fern)) created with a branched grammar set.
The image on the right is the expanded sentence displayed on-the-fly.

<img src="https://piazza.com//redirect/s3?bucket=uploads&prefix=paste%2Fm5oaxth0ok5aa%2F69ce26e9e55016e63c3b58361e946ba9911896f61a5135e5fb0fcac5c6b149d2%2Fdragon-curve.png" alt="dragon-curve.png" width="300" />

A dragon curve, generated with a really shallow depth of 4.

<img src="https://piazza.com//redirect/s3?bucket=uploads&prefix=paste%2Fm5oaxth0ok5aa%2F392e979a7b9085d1b594a9f1a9193472937700000bf11619aa4778787af938fd%2Fhilbert-curve.png" alt="hilbert-curve.png" width="300" />

A Hilbert's curve, not fully generated.

<img src="https://piazza.com//redirect/s3?bucket=uploads&prefix=paste%2Fm5oaxth0ok5aa%2Fc04be2c43c0b6276b917aa666bfe0b474a8097e2b51e3c21f8433dc58fdba14c%2Fkoch-curve.png" alt="koch-curve.png" width="300" />

A curve resembling the Koch snowflake. (I don't like this one, it looks so fluffed.)

</div>

## Postscripts

I personally dislikes that so-called "shape grammar".
I think it does nothing but _informalized_ a neat formal concept into a messy, unrigorous, arbitrary pile of goo.
In my opinion, there is always a "shapifization" process that's pipelined _after_ the deduction phase, to translate a token sequence into a readable shape.
Therefore, I completely went for that "indirect control" (sorry I forget the precise term) mentioned in class in this sketch.
The leaf nodes of the AST were fetched in each frame and iterated by a drawing function that'd react to these tokens: `Ff+-`.
I specifically allowed the small `f` to be the terminal version of the big `F`.

Also, you could see from the `System type` section in the settings panel that I originally tried to do various kinds of systems of formar grammar, but doing this already took me an entire day so I just gave it a finish and called it a day :))