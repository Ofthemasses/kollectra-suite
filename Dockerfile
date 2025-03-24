FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl=8.5.0-2ubuntu10.6 \
    bash=5.2.21-2ubuntu4 \
    make=4.3-4.1build2 \
    git=1:2.43.0-1ubuntu7.2 \
    python3=3.12.3-0ubuntu2 \
    python3-pip=24.0+dfsg-1ubuntu1.1 \
    nodejs=18.19.1+dfsg-6ubuntu5 \
    npm=9.2.0~ds1-2 \
    ca-certificates=20240203 \
    gnupg=2.4.4-2ubuntu17 \
    lsb-release=12.0-2 \
    libnss3-dev=2:3.98-1build1 \
    libglib2.0-0t64=2.80.0-6ubuntu3.2 \
    libdbus-1-3=1.14.10-4ubuntu4.1 \
    libatk1.0-dev=2.52.0-1build1 \
    libatk-bridge2.0-dev=2.52.0-1build1 \
    libcups2-dev=2.4.7-1.2ubuntu7.3 \
    libgtk-3-dev=3.24.41-4ubuntu1.2 \
    libasound2-dev=1.2.11-1build2 \
&& rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
&& echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
&& apt-get update \
&& apt-get install -y --no-install-recommends docker-ce=5:28.0.2-1~ubuntu.24.04~noble \
&& rm -rf /var/lib/apt/lists/*

RUN curl -sSL https://install.python-poetry.org | POETRY_HOME=/usr/local POETRY_VERSION=2.1.1 python3 -

WORKDIR /project

COPY pyproject.toml poetry.lock README.md package.json package-lock.json ./

COPY .git/ ./.git/

RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

RUN git config --global --add safe.directory /project

RUN pre-commit install && pre-commit install --hook-type commit-msg

RUN npm install

ENTRYPOINT ["/bin/bash"]
