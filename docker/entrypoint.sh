#!/bin/sh
set -e

# Falha cedo, com mensagem clara, se faltar alguma variável de ambiente obrigatória.
# O .env não vai para a imagem: as variáveis precisam estar no serviço (Easypanel > Environment).
require_env() {
  missing=""
  for name in "$@"; do
    eval "value=\${$name:-}"
    [ -z "$value" ] && missing="$missing $name"
  done
  if [ -n "$missing" ]; then
    echo "[entrypoint] variáveis de ambiente ausentes:$missing" >&2
    echo "[entrypoint] configure-as no serviço (Easypanel > Environment) e faça o deploy de novo" >&2
    exit 1
  fi
}

case "$APP_ROLE" in
  worker)
    require_env DATABASE_URL RABBITMQ_URL COLMEIA_CALLBACK_URL COLMEIA_TOKEN COLMEIA_ID_SOCIAL_NETWORK
    echo "[entrypoint] iniciando worker"
    exec node --import tsx worker.ts
    ;;
  api|"")
    require_env DATABASE_URL RABBITMQ_URL
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
