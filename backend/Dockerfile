# ===========================================
# SIMTA Backend - Dockerfile
# ===========================================
# Optimized for HuggingFace Spaces deployment
# Port: 7860 (HuggingFace standard)

# Use Node.js 20 LTS on Alpine for smaller image size
FROM node:20-alpine

# Set maintainer info
LABEL maintainer="ITEBA"
LABEL description="SIMTA Backend API - Sistem Informasi Manajemen Tugas Akhir"

# Create app directory
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (production only)
# Using ci for cleaner installs
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copy application source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S simta -u 1001 -G nodejs

# Set ownership of the app directory
RUN chown -R simta:nodejs /app

# Switch to non-root user
USER simta

# Expose port 7860 (HuggingFace Spaces standard)
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:7860/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "app.js"]
