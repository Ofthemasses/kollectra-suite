#!/bin/bash

WATCH_DIR="/yosys-project"
PATTERN=".*\.v$"
EVENTS="moved_to,close_write"
TOKEN="[WATCHER]"

inotifywait -m -r -e $EVENTS --format '%w%f' "$WATCH_DIR" \
  | while read FILE; do
      if echo "$FILE" | grep -qE "$PATTERN"; then
        echo "${TOKEN} ${FILE}"
      fi
    done &

exec /bin/bash
