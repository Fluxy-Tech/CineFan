#!/bin/sh
set -e

case "$APP_ROLE" in
  worker)
    echo "[entrypoint] iniciando worker"
    exec node --import tsx worker.ts
    ;;
  api|"")
    if [ "$RUN_MIGRATIONS" != "false" ]; then
      echo "[entrypoint] aplicando migrations"
      node_modules/.bin/prisma migrate deploy --config prisma7.config.ts
    fi
    echo "[entrypoint] iniciando API"
    exec node --import tsx server.ts
    ;;
  *)
    echo "[entrypoint] APP_ROLE inválido: $APP_ROLE (use api ou worker)" >&2
    exit 1
    ;;
esac
