# Base image for all stages
FROM node:22-slim AS base
ENV CYPRESS_INSTALL_BINARY=0
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install all dependencies (including dev dependencies for building)
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Generate Prisma Client and build the application
FROM dependencies AS build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image with only production dependencies
FROM base AS production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built application and Prisma files
COPY --from=build /app/build ./build
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/generated ./generated
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

# Expose port
EXPOSE 3000

# Health check (optional but recommended)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run migrations and start the server
# Note: prisma migrate deploy only runs migrations that haven't been applied yet
# It's safe to run on every container start
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
