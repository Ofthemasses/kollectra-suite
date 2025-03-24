.PHONY: build-docker run-docker dev

dev: build-docker run-docker

build-docker:
	docker build -t kollectra-suite-dev .

run-docker:
	docker run -it --rm \
	  -e DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix \
	  --user="$(id --user):$(id --group)" \
      -v /var/run/docker.sock:/var/run/docker.sock \
	  -v $(PWD):/project \
	  kollectra-suite-dev
