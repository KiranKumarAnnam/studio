# Use the official Node.js 20 image as a base.
FROM node:20-alpine AS base

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and lock files.
COPY package.json ./
# Use package-lock.json if it exists, otherwise it will be ignored.
COPY package-lock.json* ./

# Install dependencies.
# Using --frozen-lockfile is a good practice for CI/CD and Docker builds.
RUN npm install --frozen-lockfile

# Copy the rest of the application source code.
COPY . .

# Build the Next.js application for production.
RUN npm run build

# Start a new stage from a smaller base image for the production environment.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Copy the build output from the 'base' stage.
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json

# Next.js collects anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following lines in case you want to disable telemetry.
# ARG NEXT_TELEMETRY_DISABLED
# ENV NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED}

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# The Next.js server starts on port 3000 by default.
EXPOSE 3000

# Set the command to run the application.
CMD ["node", "server.js"]
