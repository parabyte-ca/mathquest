# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json VERSION ./
COPY server ./server
COPY shared ./shared
COPY web ./web
COPY scripts ./scripts
COPY content ./content
RUN npm run build

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.source="https://github.com/parabyte-ca/mathquest" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.title="MathQuest"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY content ./content
COPY package.json VERSION ./
EXPOSE 8086
CMD ["node", "dist/server/index.js"]
