#!/bin/sh
set -u

echo "[family-rhythm] Initializing /app/data"
mkdir -p /app/data

if command -v chown >/dev/null 2>&1; then
  chown -R 1000:1000 /app/data 2>/dev/null || {
    echo "[family-rhythm] WARNING: Could not change /app/data ownership."
  }
fi

if command -v setpriv >/dev/null 2>&1 && \
   setpriv --reuid=1000 --regid=1000 --init-groups -- test -w /app/data; then
  echo "[family-rhythm] Starting as user 1000"
  exec setpriv --reuid=1000 --regid=1000 --init-groups -- "$@"
fi

echo "[family-rhythm] WARNING: Falling back to container root because /app/data is not writable by user 1000."
echo "[family-rhythm] Starting server"
exec "$@"
