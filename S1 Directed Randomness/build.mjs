import * as esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/index.mts'],
	bundle: true,
	outfile: 'bundle.cjs',
	charset: 'utf8',
	format: 'cjs',
	minify: false,
	treeShaking: false,
	tsconfig: './tsconfig.json'
})