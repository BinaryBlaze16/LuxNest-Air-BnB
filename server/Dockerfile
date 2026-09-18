# ==========================================
# LuxNest REST API Backend Dockerfile
# ==========================================
FROM node:22-alpine

WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm ci --only=production --prefer-offline --no-audit

# Copy server application files
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose backend API port
EXPOSE 5050

# Set environment
ENV NODE_ENV=production
ENV PORT=5050

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5050/api/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
