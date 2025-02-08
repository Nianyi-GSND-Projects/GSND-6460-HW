/** Adding some missing function signatures. */

import '@types/p5/global.d.ts';
import type p5 from 'p5';
export default p5;

declare global {
	function beginClip(): void;
	function endClip(): void;
	interface Window {
		preload(): void;
		setup(): void;
		draw(): void;
	}
}