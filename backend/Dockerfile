# --- Dev stage (hot-reload) ---
FROM node:24-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 5000
CMD ["npm", "run", "dev"]

# --- Build stage ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Production stage ---
FROM node:24-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads

RUN addgroup -S nodejs && adduser -S nodejs -g nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/healthz', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/app.js"]
