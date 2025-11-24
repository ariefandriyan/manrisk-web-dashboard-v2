# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy server source
COPY server ./server

# Build backend
RUN npm run build:server

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/dist ./dist

# Copy built backend from backend-builder
COPY --from=backend-builder /app/dist/server ./dist/server

# Copy server models, config, migrations, seeders
COPY server/models ./server/models
COPY server/config ./server/config
COPY server/migrations ./server/migrations
COPY server/seeders ./server/seeders
COPY server/services ./server/services
COPY server/data_initials ./server/data_initials

# Expose ports
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server (serves both API and frontend)
CMD ["node", "dist/server/index.js"]
