# Build stage - Build the React frontend
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage - Full TeX Live with all packages
FROM node:20-slim

WORKDIR /app

# Install TeX Live (full) and poppler-utils for PDF to PNG conversion
# Using Debian's texlive-full to ensure all packages including tikz-tab are available
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-full \
    poppler-utils \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy the server file
COPY server.js ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=120s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server.js"]
