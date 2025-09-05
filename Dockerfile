# ---- Base Image ----
# The base image is used to build the application.
# It includes all the necessary dependencies to build the app.
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies.
# Using --frozen-lockfile is a good practice for CI/CD and Docker builds.
RUN npm install --frozen-lockfile

# Copy the rest of the application source code.
COPY . .

# Build the application.
# This will create a .next folder with the built application.
RUN npm run build

# ---- Runner Image ----
# The runner image is used to run the application.
# It's a smaller image that only contains the necessary files to run the app.
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables.
ENV NODE_ENV=production

# Install production dependencies.
# This will install only the dependencies listed in the "dependencies" section of package.json.
COPY --from=base /app/package.json ./
RUN npm install --production --frozen-lockfile

# Copy the built application from the base image.
# This includes the Next.js server, static assets, and public files.
# The standalone output mode creates a minimal server with only the necessary files.
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

# The port the application will run on.
# This should match the port in the docker run command.
EXPOSE 3000

# The command to start the application.
# This will start the Next.js server in production mode.
CMD ["node", "server.js"]
