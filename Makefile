.PHONY: build-docker run-docker dev

UID := $(shell id -u)
GID := $(shell id -g)
DOCKER_GID := $(shell stat -c "%g" /var/run/docker.sock)
VOLUME ?=

dev: build-docker run-docker

build-docker:
	docker build -t kollectra-suite-dev .

run-docker:
	docker run -it --rm \
	  -e DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix \
	  -e DBUS_SESSION_BUS_ADDRESS \
	  -v /run/user/1000/bus:/run/user/1000/bus \
	  -v /run/dbus/system_bus_socket:/run/dbus/system_bus_socket \
	  --user="$(UID):$(GID)" \
	  --group-add $(DOCKER_GID) \
      -v /var/run/docker.sock:/var/run/docker.sock \
	  -v $(PWD):/project \
	  $(if $(VOLUME), -v $(VOLUME):$(VOLUME):ro) \
	  kollectra-suite-dev
