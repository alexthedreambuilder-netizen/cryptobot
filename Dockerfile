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

# Expose port
EXPOSE 3000

# Start command - migrate DB and start server
CMD npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0 --port 3000
