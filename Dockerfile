# CineFan - imagem única para API e worker (escolha com APP_ROLE=api|worker)
FROM node:22-slim

# OpenSSL é exigido pelo schema engine do Prisma (prisma migrate deploy)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependências primeiro (cache de camada). Inclui devDependencies: o app roda
# TypeScript via tsx e o CLI do Prisma é usado para aplicar as migrations.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY . .

# Gera o Prisma Client em ./generated/prisma (não precisa de banco)
RUN node_modules/.bin/prisma generate --config prisma7.config.ts \
  && chmod +x docker/entrypoint.sh \
  && chown -R node:node /app

ENV NODE_ENV=production \
    PORT=9001 \
    APP_ROLE=api \
    RUN_MIGRATIONS=true

USER node
EXPOSE 9001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD test "$APP_ROLE" = "worker" || node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["docker/entrypoint.sh"]
