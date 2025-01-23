/** Adding some missing function signatures. */

import '@types/p5/global.d.ts';

declare global {
	function beginClip(): void;
	function endClip(): void;
}