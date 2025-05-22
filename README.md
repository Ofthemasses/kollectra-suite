# kollectra-suite

A electron based suite for HDL schematic vewing for yosys projects

## Installation
### Docker (X11)
We provide a development container to work in with the project.
#### Dependencies
- docker
- x11

#### Permit connections from docker to your hosts X11 serevr
```bash
xhost local:docker
```

#### Build and launch the docker container
```bash
make dev
```

To include an additional volume with its file path replicated inside the container, use the VOLUME variable when running make:

```bash
make VOLUME=/some/path dev
```

The application may open a file browser inside the container when it requests
access to a host directory. Mounting the volume at the same path ensures that
the expected files are available when this happens.

### Launch the application

#### Run application
```bash
npm run start
```

## Project Philosophy
You may notice topics on issues and a requirement for topics to be chosen during the
creation of issues. These topics each relate to a project philosophy topic of kollectra.

To see the project philosophy and philosophy topics please refer to the README of the main build [here](https://codeberg.org/ofthemasses/kollectra/src/branch/master/README.md).
