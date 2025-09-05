# Dockerfile for a Next.js application

# 1. Base Stage: Install dependencies and build the application
FROM node:20-alpine AS base
WORKDIR /app

# Copy package and lock files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies.
# Using --frozen-lockfile is a good practice for CI/CD and Docker builds.
RUN npm install --frozen-lockfile

# Copy the rest of the application source code.
COPY . .

# Build the application.
RUN npm run build

# 2. Runner Stage: Create a small, secure production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output from the base stage.
COPY --from=base /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static

# Change ownership of the app directory
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the application
CMD ["node", "server.js"]
