# Stage 1: Build dependencies
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package config
COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build steps)
RUN npm ci

# Copy source code
COPY . .

# Stage 2: Runtime image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Set production env
ENV NODE_ENV=production

# Copy package config
COPY package*.json ./

# Install production-only dependencies
RUN npm ci --only=production

# Copy source code from builder stage
COPY --from=builder /usr/src/app/src ./src

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Run the app
CMD ["node", "src/app.js"]
