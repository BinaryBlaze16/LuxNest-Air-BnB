# ==========================================
# LuxNest Luxury Airbnb Full-Stack Dockerfile
# Multi-Stage Build: Client + Server in One Container
# ==========================================

# ------------------------------------------
# Stage 1: Build React + Vite SPA Frontend
# ------------------------------------------
FROM node:22-alpine AS client-builder

WORKDIR /app/client

# Install frontend dependencies
COPY client/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy client source code and build
COPY client/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ------------------------------------------
# Stage 2: Production Server Runtime
# ------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5050

# Install server production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production --prefer-offline --no-audit

# Copy server code
COPY server/ /app/server/

# Copy built frontend assets from client-builder stage
COPY --from=client-builder /app/client/dist /app/client/dist

# Create uploads directory if not present
RUN mkdir -p /app/server/uploads

# Expose backend REST API / full-stack port
EXPOSE 5050

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/api/health || exit 1

# Start LuxNest Server
CMD ["node", "server.js"]
