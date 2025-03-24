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

### Launch the application
#### Build
```bash
npm run build
```

#### Run application
```bash
npm run start
```

## Project Philosophy
You may notice topics on issues and a requirement for topics to be chosen during the
creation of issues. These topics each relate to a project philosophy topic of kollectra.

To see the project philosophy and philosophy topics please refer to the README of the main build [here](https://codeberg.org/ofthemasses/kollectra/src/branch/master/README.md).
