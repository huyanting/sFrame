# vim: set noet :

.PHONY: clean all release

all: clean

clean:

release:
	npm install
	npm run build
	


