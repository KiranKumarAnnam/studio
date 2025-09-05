# SpendWise

This is a Next.js application for tracking your daily expenses, built with Firebase Studio.

## Features

- **Add and manage expenses:** Easily record and delete your daily spending.
- **AI-powered category suggestions:** Get smart suggestions for expense categories based on the description.
- **Multi-currency support:** View your expenses in different currencies, including USD, INR, and EUR.
- **Export to CSV:** Download your expense data for further analysis.
- **Modern UI:** A clean and responsive user interface built with Next.js, React, ShadCN UI, and Tailwind CSS.

## Getting Started

To get started with the application, first install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start by exploring the main application page located at `src/app/page.tsx`.

## Running with Docker

You can also run this application inside a Docker container. This is useful for creating a consistent and isolated environment.

### Prerequisites

First, you need to have Docker installed on your Linux system. If you don't have it, you can install it by following the official documentation for your distribution (e.g., Ubuntu, CentOS).

For Ubuntu/Debian-based systems, you can typically install it with:
```bash
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### Build the Docker Image

Navigate to the project's root directory (where the `Dockerfile` is located) and run the following command to build the Docker image. We'll tag it as `spendwise`.

```bash
docker build -t spendwise .
```

### Run the Docker Container

Once the image is built, you can run it as a container with this command:

```bash
docker run -p 3000:3000 spendwise
```

This command starts the container and maps port 3000 on your host machine to port 3000 inside the container.

You can now access the application by opening your web browser and navigating to [http://localhost:3000](http://localhost:3000).
