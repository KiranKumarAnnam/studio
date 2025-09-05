# Dockerfile

# 1. Base Stage: Install dependencies and build the application
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json ./
COPY package-lock.json* ./

# Install all dependencies, including devDependencies needed for the build
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# 2. Runner Stage: Create the final, optimized production image
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user and group for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the base stage
COPY --from=base /app/package.json ./package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to the non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000
# ENV NEXT_TELEMETRY_DISABLED=1

CMD ["node", "server.js"]
