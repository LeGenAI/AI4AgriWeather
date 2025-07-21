FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Install serve globally for static file hosting
RUN npm install -g serve

# Copy all source files
COPY . .

# Build the Vite application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Use serve to host the built files
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]