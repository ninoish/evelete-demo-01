# Base image for all stages
FROM node:22-slim AS base
ENV CYPRESS_INSTALL_BINARY=0
# Configure npm for better network reliability
ENV NPM_CONFIG_FETCH_TIMEOUT=300000
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=10000
ENV NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=60000
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-timeout 300000 \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 10000 \
  && npm config set fetch-retry-maxtimeout 60000

# Install all dependencies (including dev dependencies for building)
FROM base AS dependencies
COPY package.json package-lock.json ./
# Retry npm ci with exponential backoff on network errors
RUN npm ci || (sleep 5 && npm ci) || (sleep 10 && npm ci) || (sleep 20 && npm ci)

# Generate Prisma Client and build the application
FROM dependencies AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image with only production dependencies
FROM base AS production
COPY package.json package-lock.json ./
# Install production dependencies including @prisma/client with all runtime files
RUN npm ci

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
RUN npx prisma generate

# Copy built application and Prisma files
COPY --from=build /app/build ./build

RUN cp ./build/server/index.js ./build/server/index.cjs

# Expose port
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations and start the server
# Prisma Client is already generated in build stage, so we only need to run migrations
# prisma migrate deploy applies existing migrations without running prisma generate
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
