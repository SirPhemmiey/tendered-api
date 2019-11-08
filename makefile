check-install-deps:
	node check-install-dependencies.js

start_server: check-install-deps
	node ./bin/www