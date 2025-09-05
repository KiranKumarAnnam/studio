# syntax=docker/dockerfile:1

# --- Base Stage ---
# Installs dependencies. This is a separate stage to leverage Docker's layer caching.
# Dependencies are only re-installed when package.json or package-lock.json changes.
FROM node:20-alpine AS base
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies.
# Using --frozen-lockfile is a good practice for CI/CD and Docker builds.
RUN npm install --production --frozen-lockfile

# Copy the rest of the application source code.
COPY . .


# --- Builder Stage ---
# Builds the Next.js application.
FROM base AS builder

# Re-install all dependencies, including devDependencies, for building.
RUN npm install --frozen-lockfile
# Build the Next.js application.
RUN npm run build


# --- Runner Stage ---
# Creates the final, small production image.
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables.
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application from the builder stage.
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Set the user to the non-root user.
USER nextjs

# Expose the port the app runs on.
EXPOSE 3000

# Start the Next.js application.
CMD ["npm", "start"]
