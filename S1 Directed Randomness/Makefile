entry=src/index.mts
banner=banner.js
tsconfig=tsconfig.json
target=bundle.cjs

$(target): banner.js src/*.mts
	@esbuild \
		$(entry) \
		--outfile=$(target) \
		--bundle \
		--charset=utf8 \
		--format=cjs \
		--minify=false \
		--tree-shaking=false \
		--tsconfig=$(tsconfig) \
		--banner:js="$$(cat $(banner))" \
	;

clean:
	@rm -f $(target);