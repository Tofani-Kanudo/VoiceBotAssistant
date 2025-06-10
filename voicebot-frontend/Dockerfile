# === Stage 1: Build ===
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy source code
COPY . .

# === Stage 2: Runtime ===
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app ./

# Only include production dependencies (already installed)
# No need to run npm install here again

EXPOSE 3000
CMD ["npm", "start"]
