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

# Production stage - Minimal TeX Live with only required packages
FROM node:20-slim

WORKDIR /app

# Install minimal TeX Live and required packages for tkz-tab
# Using texlive-base + specific packages to reduce memory usage
# tkz-tab is included in texlive-pictures
RUN apt-get update && apt-get install -y --no-install-recommends \
    texlive-base \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-pictures \
    texlive-latex-extra \
    poppler-utils \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

# Verify tkz-tab is available
RUN kpsewhich tkz-tab.sty || echo "Warning: tkz-tab.sty not found, LaTeX may fail"

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy the server file
COPY server.js ./

# Set environment variables for memory optimization
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--max-old-space-size=256"

# Expose the port
EXPOSE 3000

# Health check (with longer start period for cold starts on free tier)
HEALTHCHECK --interval=30s --timeout=60s --start-period=180s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "server.js"]
