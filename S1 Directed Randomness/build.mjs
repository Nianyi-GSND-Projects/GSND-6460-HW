import * as esbuild from 'esbuild'

await esbuild.build({
	entryPoints: ['src/index.mts'],
	bundle: true,
	outfile: 'index.cjs',
	charset: 'utf8',
	format: 'cjs',
	minify: false,
	treeShaking: false,
	tsconfig: './tsconfig.json'
})