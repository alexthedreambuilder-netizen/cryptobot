FROM node:20-slim

WORKDIR /app

# Install OpenSSL and other dependencies
RUN apt-get update -y && apt-get install -y openssl libssl-dev

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy app files
COPY . .

# Build the app
RUN npm run build

# Copy standalone server
COPY .next/standalone ./
COPY .next/static ./.next/static

# Expose port
EXPOSE 3000

# Set environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start command
CMD node server.js
