entry=src/index.mts
banner=banner.js
tsconfig=tsconfig.json
outDir=dist/
target=$(outDir)index.cjs

$(target): src/*.mts
	@esbuild \
		$(entry) \
		--outfile=$(target) \
		--bundle \
		--charset=utf8 \
		--format=cjs \
		--minify=false \
		--tsconfig=$(tsconfig) \
		--banner:js="$$(cat $(banner))" \
	;

$(outDir):
	mkdir $(outDir);

clean:
	@rm -f $(target);

dev:
	npx vite;