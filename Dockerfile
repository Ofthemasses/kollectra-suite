FROM alpine:3.21.3

RUN apk add --no-cache \
    "curl=8.12.1-r1" \
    "bash=5.2.37-r0" \
    "make=4.4.1-r2" \
    "git=2.47.2-r0" \
    "python3=3.12.9-r0" \
    "py3-pip=24.3.1-r0"

RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local POETRY_VERSION=2.1.1 python3 -

COPY pyproject.toml poetry.lock README.md ./

RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

WORKDIR /project

ENTRYPOINT ["/bin/bash"]
