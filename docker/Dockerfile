# syntax=docker/dockerfile:1

# One Dockerfile for the whole monorepo. Each service is a "target" (a final stage),
# and all of them share the same dependency layers, so npm ci runs only once.
# The build context is the repository root, because every app needs packages/*.

FROM node:24-bookworm-slim AS base
WORKDIR /app


# ---------- deps: install every workspace ----------
# Only the package files are copied here, so this layer stays cached until a
# dependency changes (and not on every code change).
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/ws-server/package.json apps/ws-server/
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/
COPY packages/queue/package.json packages/queue/
COPY packages/schemas/package.json packages/schemas/
RUN npm ci


# ---------- source: dependencies + the code ----------
FROM deps AS source
COPY . .


# ---------- api (REST) ----------
# The internal packages point "main" to src/index.ts, so the services run
# TypeScript directly with tsx, the same way they do in development.
FROM source AS api
WORKDIR /app/apps/api
EXPOSE 3333
CMD ["node", "--import", "tsx", "src/server.ts"]


# ---------- ws-server (WebSocket) ----------
FROM source AS ws-server
WORKDIR /app/apps/ws-server
EXPOSE 3334
CMD ["node", "--import", "tsx", "src/index.ts"]


# ---------- worker (ffmpeg transcoding) ----------
FROM source AS worker
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/apps/worker
CMD ["node", "--import", "tsx", "src/index.ts"]


# ---------- web (Next.js) ----------
# NEXT_PUBLIC_* values are written into the JavaScript bundle at build time,
# so they come in as build args and not as runtime variables.
FROM source AS web
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
RUN npm run build -w apps/web
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0"]