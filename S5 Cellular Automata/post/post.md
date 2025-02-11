<p style="font-weight: bold; text-align: center;">
Content warning: The warping pattern might be slightly disturbing to some people.
</p>

<hr />

## Links

- [p5.js sketch page](https://editor.p5js.org/WangNianyi2001/sketches/JbPxidtX3)

## Attribution

- Definitely no external assistance is used.

## Explanation

Cellular automata is... I have to say, a really cliche topic to do.
Like, everybody knows how its rules are like, and there is mostly only one "standard" way to do it... as taken by most people.
However, there are indeed many non-standard automatas, e.g. the one that's displayed on _Wolfram Alpha_'s homepage.
So I wanted to customize one out, and thought, "hey, the cell states don't have to be discrete, do they?"
In the end, I decided to make it fluid and driven by a differential equation.
The best testfield for this idea shall be—a water height field!
The equation is really simple, and the iterative adaptation is just letting the second derivative of the height of the water surface proportional to the, err, I don't know the term in English, but the Nabla operator of the scalar field at the point.
All I need to do is to write the data structure and the algorithm out.

## Design recipe

### 1. Intention

Present a lively simulated quad that behaves like a water surface.
It's initialized with a random noise texture, with the lighter parts being higher and the darker parts being lower in height.
As time passes, it shall flatten out like what real water would do.

The user could also use their mouse to play with the water: LMB increases the height, and RMB decreases.

### 2. State types

This time it's really simple: Just store a 2D array (implemented in 1D, I wrapped it up with accessors) of the information of the water height field at each point—the height and the speed that the height changes. So basically, two 2D arrays (arraies? lol).

### 3. Required library functions

Just `resetMatrix`, `scale`, `translate`, `noStroke`, `fill` and `rect`.
They are only used to draw each pixels.

### 4. Instruction

- Just hit play and you shall see a square region colored in gray being animated, that's the water height field.
- Use LMB/RMB to affect the water height at a point.

## Gallery

<div style="text-align: center;">

<img width="200" src="/redirect/s3?bucket=uploads&amp;prefix=paste%2Fm5oaxth0ok5aa%2Fb8987de6fe402c9b8e854b9f2c25ba180b7a2f06769653d03cc61105484077f7%2Fwater-initial-sample.png" />
<img width="200" src="/redirect/s3?bucket=uploads&amp;prefix=paste%2Fm5oaxth0ok5aa%2F9e2194fae4bc4813e4e33f9cb3d2f3399a92c3da6c7f5df84664fd5c013bc8a5%2Fwater-initial-sample-1.png" />
<img width="200" src="/redirect/s3?bucket=uploads&amp;prefix=paste%2Fm5oaxth0ok5aa%2F5948ea1ac712e67b0e63eb053c3b9e0ed6a96fca5d9655a321a97c8a70479be6%2Fwater-initial-sample-2.png" />
<img width="200" src="/redirect/s3?bucket=uploads&amp;prefix=paste%2Fm5oaxth0ok5aa%2F258aacf7969c4aed766a3cef01dc4da706334be8a621ebe806bc46bd136f4f08%2Fwater-initial-sample-3.png" />

A sequence of screenshots showing the process of the water surface "smoothing out".

<img width="400" src="/redirect/s3?bucket=uploads&amp;prefix=paste%2Fm5oaxth0ok5aa%2F7930532b1ccb7114bef7f525e30fcaa1c9ab51db5726d90bc5f3296b2edb02aa%2Fwater-animated.gif" />

An animated GIF (~=10MB) showing another example of the same process.

</div>