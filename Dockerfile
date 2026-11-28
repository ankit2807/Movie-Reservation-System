# ── Stage 1: Build Frontend SPA (React + TypeScript + Vite) ──
FROM node:22-bookworm-slim AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Compile Backend TypeScript ──
FROM node:22-bookworm-slim AS server-builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY index.ts ./
COPY database ./database
COPY models ./models
COPY controller ./controller
COPY routes ./routes
COPY utils ./utils
COPY tools ./tools
COPY types ./types
RUN npm run build:server

# ── Stage 3: Production API & Static Server ──
FROM node:22-bookworm-slim AS production
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=server-builder /app/dist ./dist
COPY --from=client-builder /app/client/dist ./client/dist

RUN mkdir -p /app/public && chown -R node:node /app
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
