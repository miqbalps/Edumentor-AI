# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package config
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set dynamic API URL argument during build
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the Vite React application
RUN npm run build

# Stage 2: Production release with Nginx
FROM nginx:1.25-alpine

# Copy built assets from Stage 1 to Nginx HTML folder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
