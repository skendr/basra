FROM node:20-slim AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./
COPY shared/package.json shared/
COPY server/package.json server/

# Install all workspace dependencies
RUN npm ci --workspace=shared --workspace=server

# Copy source
COPY shared/ shared/
COPY server/ server/
COPY tsconfig.base.json ./

# Build shared then server
RUN npm run build --workspace=shared
RUN npm run build --workspace=server

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/shared/package.json shared/
COPY --from=builder /app/server/package.json server/

RUN npm ci --workspace=shared --workspace=server --omit=dev

COPY --from=builder /app/shared/dist/ shared/dist/
COPY --from=builder /app/shared/src/ shared/src/
COPY --from=builder /app/server/dist/ server/dist/

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/dist/index.js"]
