# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install TeX Live and poppler-utils (for pdftocairo)
# Using Alpine's texlive packages - minimal installation with required packages
RUN apk add --no-cache \
    texlive \
    texlive-xetex \
    texmf-dist-latexextra \
    texmf-dist-pictures \
    poppler-utils \
    && rm -rf /var/cache/apk/*

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

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
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server.js"]
