# S1 Directed Randomness

In this week's sketch, I implemented the _Wave-function Collapse_ (WFG) algorithm to generate a grid-based map under the constraint of a generation ruleset.

- [The p5.js sketch page](https://editor.p5js.org/WangNianyi2001/sketches/xMU9KuitU)
- [Source project](https://github.com/Nianyi-GSND-Projects/GSND-6460-HW/tree/master/S1%20Directed%20Randomness)

## Notes on bundling

Due to the nature of p5.js, it doesn't have good support for modularization and the new grammars added into ECMAScript, which limits the clarity for my development.
Therefore, I wrote the codes all at my local end in a modularized way, then used _[esbuild](https://esbuild.github.io/) to bundle the source code all together into a broswer-runnable sketch.

To bundle the source code yourself:

1. Download or clone this repository.
1. Open in command-line and navigate to the folder `/S1 Directed Randomness`.
1. Run `npm i` to install the dependencies (make sure that NodeJS and NPM are installed on your computer).
1. Run `make` to perform bundling (make sure to have GNU Make on your computer).
1. The bundled result is at `./bundle.cjs`.