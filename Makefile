.PHONY: build-docker run-docker dev

dev: build-docker run-docker

build-docker:
	docker build -t kollectra-suite-dev .

run-docker:
	docker run -it --rm -v $(PWD):/project kollectra-suite-dev
