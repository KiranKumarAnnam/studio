# SpendWise Project Structure

Welcome to the SpendWise project! This document provides an overview of the folder structure and the key files to help you navigate the codebase.

## High-Level Overview

The application is built using Next.js with the App Router, TypeScript, Tailwind CSS for styling, and Genkit for AI features.

```
/
├── .next/           # Next.js build output (auto-generated)
├── node_modules/    # Project dependencies (auto-generated)
├── src/             # Main application source code
│   ├── app/         # Next.js App Router directory
│   ├── components/  # Reusable React components
│   ├── lib/         # Helper functions, type definitions, and utilities
│   ├── ai/          # AI-related code (Genkit flows)
│   └── hooks/       # Custom React hooks
├── .env             # Environment variables
├── next.config.ts   # Next.js configuration
├── package.json     # Project dependencies and scripts
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
├── README.md        # General project information
└── HELP.md          # This file
```

## `src` Directory

This is where all the primary source code for the application resides.

### `src/app/`

This directory is the core of the Next.js application, following the App Router paradigm.

-   **`page.tsx`**: The main entry point and primary UI for the application dashboard. It manages the state for expenses, categories, and budgets.
-   **`layout.tsx`**: The root layout for the application. It includes the `<html>` and `<body>` tags and wraps all pages. This is where global styles and fonts are imported.
-   **`globals.css`**: Contains global styles, Tailwind CSS base directives, and the color theme variables for ShadCN UI components (both light and dark mode).
-   **`actions.ts`**: Holds server-side functions (Next.js Server Actions) that are called from client components, such as fetching AI category suggestions.

### `src/components/`

This folder contains all the React components used to build the user interface.

-   **`ui/`**: This sub-directory holds all the generic, reusable UI components provided by the ShadCN library (e.g., `Button`, `Card`, `Input`, `Dialog`). These are the building blocks of the UI.
-   **Custom Components (`*.tsx`)**:
    -   `app-header.tsx`: The main header of the application.
    -   `expense-summary.tsx`: Displays the summary cards for different time periods (Today, This Month, etc.).
    -   `expense-table.tsx`: The main table for listing, adding, and deleting expenses.
    -   `budget-goals.tsx`: The card for setting and tracking monthly/yearly budgets.
    -   `expense-chart.tsx`: The pie chart component for visualizing monthly spending.
    -   `upcoming-payments.tsx`: The card that shows upcoming recurring bills.

### `src/lib/`

This directory contains libraries, helper functions, and shared code that is not a React component.

-   **`types.ts`**: Defines the core TypeScript types used throughout the application, such as `Expense`, `Budget`, and `SummaryPeriod`.
-   **`helpers.ts`**: Contains utility functions for specific tasks, like `formatCurrency` for displaying monetary values and `exportToCsv` for data export.
-   **`utils.ts`**: A utility file from ShadCN, most notably containing the `cn` function for merging and conditionally applying Tailwind CSS classes.
-   **`logger.ts`**: A simple server-side logger to write activity to a log file (`activity.log`).

### `src/ai/`

This directory is dedicated to the Generative AI functionalities of the app, powered by Genkit.

-   **`genkit.ts`**: Configures and initializes the Genkit instance, specifying the AI model to be used.
-   **`flows/`**: Contains the Genkit "flows," which are the core units of AI work.
    -   `suggest-expense-categories.ts`: The flow that takes an expense description and uses an LLM to suggest relevant categories.
-   **`dev.ts`**: An entry point for running the Genkit development server.

### `src/hooks/`

This folder contains custom React hooks to encapsulate and reuse stateful logic.

-   **`use-toast.ts`**: A hook for triggering and managing toast notifications.
-   **`use-mobile.tsx`**: A hook that detects if the user is on a mobile-sized screen.

## Root Directory Files

-   **`package.json`**: Defines project metadata, dependencies (`dependencies`), development dependencies (`devDependencies`), and scripts (`scripts`) like `dev`, `build`, and `start`.
-   **`next.config.ts`**: Configuration file for the Next.js framework.
-   **`tailwind.config.ts`**: Configuration file for Tailwind CSS, including theme extensions like custom fonts and colors.
-   **`tsconfig.json`**: The configuration file for the TypeScript compiler, defining how it should check your code.
-   **`README.md`**: The main README file with instructions on how to get the project running.
