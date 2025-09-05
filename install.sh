#!/bin/bash

# Define the name for your Docker image and container
IMAGE_NAME="spendwise"
CONTAINER_NAME="spendwise-app"

# Set the port mapping
HOST_PORT=3000
CONTAINER_PORT=3000

# Check if a container with the same name is running and stop/remove it
if [ $(docker ps -a -q -f name=^/${CONTAINER_NAME}$) ]; then
    echo "-----> Stopping and removing existing container: ${CONTAINER_NAME}"
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
    echo "-----> Old container removed."
fi

# Check if the host port is already in use by another container
if [ "$(docker ps -q -f "publish=${HOST_PORT}")" ]; then
    echo "!!!!!! Port ${HOST_PORT} is already in use by another container."
    echo "!!!!!! Please stop the other container or choose a different port."
    exit 1
fi


# Build the Docker image from the Dockerfile in the current directory
echo "-----> Building Docker image: ${IMAGE_NAME}"
docker build -t ${IMAGE_NAME} .

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "!!!!!! Docker build failed. Please check the output above for errors."
    exit 1
fi

echo "-----> Docker image built successfully."

# Run the new Docker container
echo "-----> Starting new container: ${CONTAINER_NAME} on port ${HOST_PORT}"
docker run -d -p ${HOST_PORT}:${CONTAINER_PORT} --name ${CONTAINER_NAME} ${IMAGE_NAME}

echo "-----> Container is running."
echo "-----> You can access the application at http://localhost:${HOST_PORT}"