# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/admin/package.json apps/admin/
COPY apps/mobile/package.json apps/mobile/
COPY apps/mobile/modules/wechat-open-sdk apps/mobile/modules/wechat-open-sdk
COPY apps/site/package.json apps/site/
COPY packages/config/package.json packages/config/
COPY packages/contracts/package.json packages/contracts/
COPY packages/domain/package.json packages/domain/
COPY tools/pack-builder/package.json tools/pack-builder/
COPY tools/pack-editor/package.json tools/pack-editor/
RUN pnpm install --frozen-lockfile --filter @remember/api...

FROM deps AS build
COPY packages/config packages/config
COPY packages/contracts packages/contracts
COPY tools/pack-builder tools/pack-builder
COPY apps/api apps/api
RUN pnpm --filter @remember/contracts build \
  && pnpm --filter @remember/pack-builder build \
  && pnpm --filter @remember/api exec prisma generate \
  && pnpm --filter @remember/api build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/tools/pack-builder ./tools/pack-builder
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY infra/prod/docker-entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]
