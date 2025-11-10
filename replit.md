# League of Legends Team Management Platform

## Overview

This full-stack web application provides a comprehensive platform for managing League of Legends teams. It facilitates champion evaluation across strategic dimensions, enables draft composition analysis, tracks scrim results, and manages player availability. The platform aims to enhance competitive team coordination through a data-rich interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite for development and bundling. Wouter is used for client-side routing. The UI leverages shadcn/ui (built on Radix UI) and Tailwind CSS for a Material Design-inspired gaming aesthetic, featuring a custom dark mode theme with gold accents. State management is handled by TanStack Query for server state and React Hook Form with Zod for form management. Typography uses Inter, Rajdhani, and Roboto Mono.

### Backend Architecture

The backend is an Express.js application running on Node.js with TypeScript. It provides RESTful APIs for managing champions, drafts, scrims, players, and availability. Champions are automatically seeded from the Riot Games Data Dragon API. The API includes custom middleware for logging and JSON parsing.

### Data Layer

PostgreSQL is used as the database, specifically Neon serverless PostgreSQL, with `@neondatabase/serverless` for connection pooling. Drizzle ORM provides type-safe database queries and schema management, with schema definitions exported as both Drizzle tables and Zod schemas. Drizzle Kit is used for migrations. The database models core entities such as Champions, Champion Evaluations, Drafts, Draft Variants, Scrims, Players, Player Availability, Champion Synergies, and Patch Notes.

### UI/UX Decisions

The platform features a custom theme with dark mode support and a gaming-specific color palette (gold primary, dark backgrounds). Typography combines Inter, Rajdhani, and Roboto Mono for different UI elements. Team branding includes "Nemonzia" and "NMZ" in primary gold color, along with a custom "nmz-logo.png" integrated into the sidebar. The player availability system has been simplified to a day-only table for improved usability.

### Feature Specifications

Key features include:
- Champion evaluation system with 8 characteristics (0-3 rating scale).
- Drafting tool for team compositions and position slots.
- Scrim tracking with win/loss statistics.
- Player availability grid for weekly schedules.
- Statistics Dashboard with Recharts visualization (winrate, top champions, performance trends).
- Champion Synergies System to track champion pairs and their ratings.
- Patch Notes Tracker with version management and category filtering.
- Automated Team Reports integrated into the statistics endpoint.
- Draft History with timestamp tracking.
- Full CRUD operations with Zod validation across all core entities.

## External Dependencies

### Third-Party Services

- **Riot Games Data Dragon API**: For champion data (names, IDs, images).
- **Neon Database**: Serverless PostgreSQL hosting.
- **Google Fonts**: CDN for Inter, Rajdhani, and Roboto Mono typefaces.

### Key Libraries

- **@neondatabase/serverless**: WebSocket-based PostgreSQL client for serverless environments.
- **drizzle-orm**: Lightweight TypeScript ORM.
- **@radix-ui/***: Unstyled, accessible UI component primitives.
- **@tanstack/react-query**: Async state management with caching.
- **react-hook-form**: Performant form library.
- **zod**: TypeScript-first schema validation.
- **date-fns**: Date utility library.
- **wouter**: Minimalist client-side router.
- **Recharts**: For data visualization in the statistics dashboard.