target=bundle.cjs

bundle: clean
	make $(target);

clean:
	rm -f $(target);

$(target):
	node ./build.mjs;