# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Documentation-First Approach

**BEFORE generating ANY code, you MUST:**

1. **Check the `/docs` directory** for relevant documentation files
2. **Read and understand** the applicable documentation thoroughly
3. **Follow the patterns, conventions, and best practices** specified in those docs
4. **Reference the documentation** when explaining your implementation decisions

**This is non-negotiable.** All code generation must be guided by the project's documentation in `/docs`. If documentation exists for a feature or technology you're working with, it takes precedence over general knowledge or assumptions.

When implementing features:
- Search `/docs` for relevant files (e.g., API docs, component patterns, architecture decisions)
- If you find relevant documentation, cite it in your responses
- If documentation is missing or unclear, inform the user and ask for clarification

**Example workflow:**
```
User: "Add a new workout feature"
Claude:
1. First, I'll check /docs for workout-related documentation
2. [Reads relevant docs]
3. Based on the patterns in /docs/workout-api.md, I'll implement...
```

## Project Overview

This is a Next.js 15.5.4 application using the App Router, built with TypeScript and styled with Tailwind CSS v4. The project was bootstrapped with `create-next-app` and is configured to use Turbopack for faster builds.

## Key Technologies

- **Next.js 15.5.4**: App Router architecture
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5**: Strict mode enabled
- **Tailwind CSS v4**: Using `@tailwindcss/postcss` plugin
- **ESLint 9**: Flat config format with Next.js rules
- **Turbopack**: Build tool for faster development and production builds
- **Clerk**: Authentication and user management
- **Drizzle ORM**: Type-safe database ORM
- **Neon**: Serverless Postgres database

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production (uses Turbopack)
npm run build

# Start production server
npm start

# Run ESLint
npm run lint

# Database commands
npm run db:push      # Push schema changes to database (recommended for dev)
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio database browser
```

## Project Structure

- **src/app/**: App Router directory containing all routes and layouts
  - `layout.tsx`: Root layout with Geist font configuration
  - `page.tsx`: Home page component
  - `globals.css`: Global styles and Tailwind directives
- **src/db/**: Database configuration and schemas
  - `schema.ts`: Drizzle ORM table definitions
  - `index.ts`: Database client instance
- **src/middleware.ts**: Clerk authentication middleware
- **drizzle/**: Generated migration files (auto-generated)
- **drizzle.config.ts**: Drizzle Kit configuration
- **tsconfig.json**: TypeScript configuration with path alias `@/*` pointing to `./src/*`
- **next.config.ts**: Next.js configuration (TypeScript format)
- **eslint.config.mjs**: ESLint flat config with Next.js presets
- **postcss.config.mjs**: PostCSS configuration for Tailwind v4

## Important Configuration Details

### TypeScript Path Aliases
- Use `@/` to import from the `src/` directory
- Example: `import Component from '@/components/Component'`

### Build System
- This project uses **Turbopack** for both dev and build commands (via `--turbopack` flag)
- Turbopack provides faster builds and hot module replacement

### Tailwind CSS v4
- Uses the new `@tailwindcss/postcss` plugin architecture
- No `tailwind.config.js` file needed for basic setup
- Configuration is handled through PostCSS

### ESLint
- Uses ESLint 9 flat config format (`.mjs` file)
- Extends `next/core-web-vitals` and `next/typescript`
- Ignores: `node_modules/`, `.next/`, `out/`, `build/`, `next-env.d.ts`

### Fonts
- Uses Next.js font optimization with Geist Sans and Geist Mono
- Font variables: `--font-geist-sans` and `--font-geist-mono`
- Applied via CSS variables in root layout

## App Router Architecture

This project uses Next.js App Router (not Pages Router):
- Server Components by default
- Use `'use client'` directive for client-side interactivity
- Layouts cascade down the component tree
- `metadata` export for SEO in server components
- Co-located files: route segments are defined by folders with `page.tsx`

## TypeScript Configuration

- **Strict mode**: Enabled for better type safety
- **Target**: ES2017
- **Module resolution**: Bundler mode
- **JSX**: Preserve (handled by Next.js)
- Key compiler options: `noEmit`, `esModuleInterop`, `isolatedModules`

## Authentication with Clerk

This project uses Clerk for authentication. The integration follows the official Next.js App Router approach:

### Setup Components

- **Middleware**: `src/middleware.ts` uses `clerkMiddleware()` from `@clerk/nextjs/server`
- **Provider**: `<ClerkProvider>` wraps the app in `src/app/layout.tsx`
- **Components**: Uses `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`

### Environment Variables

Required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

Get these from [Clerk Dashboard > API Keys](https://dashboard.clerk.com/last-active?path=api-keys).

### Server-Side Auth

To access auth data in Server Components or API routes:

```typescript
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();
  // Use async/await with auth()
}
```

### Client-Side Auth

For client components, use hooks:

```typescript
"use client";
import { useUser, useAuth } from "@clerk/nextjs";

export default function ClientComponent() {
  const { user } = useUser();
  const { userId } = useAuth();
  // ...
}
```

### Important Notes

- Always use `clerkMiddleware()` (not the deprecated `authMiddleware()`)
- Import auth utilities from `@clerk/nextjs/server` for server-side code
- Import hooks and components from `@clerk/nextjs` for client-side code
- The `auth()` function requires `async/await` in App Router

## Database with Drizzle ORM

This project uses Drizzle ORM with Neon Postgres for type-safe database operations. See [DATABASE.md](./DATABASE.md) for detailed documentation.

### Setup

1. Get your Neon database URL from [Neon Console](https://console.neon.tech/)
2. Add `DATABASE_URL` to `.env.local`
3. Run `npm run db:push` to sync schema to database

### Database Client Usage

```typescript
import { db } from "@/db";
import { usersTable, workoutsTable, exercisesTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Query example
const users = await db.select().from(usersTable);

// Insert example
await db.insert(usersTable).values({
  clerkId: "user_xxx",
  name: "John Doe",
  email: "john@example.com"
});

// Update example
await db.update(usersTable)
  .set({ name: "Jane Doe" })
  .where(eq(usersTable.id, 1));
```

### Database Schema

The project includes three main tables:

1. **users** - User profiles linked to Clerk via `clerkId`
2. **workouts** - Workout sessions with user relationship
3. **exercises** - Individual exercises within workouts

All tables include automatic timestamps (`createdAt`, `updatedAt`) and use cascading deletes for data integrity.

### Important Notes

- Use `@/db` path alias to import database client
- Database connection is optimized for serverless/Edge runtime via Neon HTTP
- For server components and API routes, directly use the `db` instance
- Type inference is automatic via Drizzle's `$inferSelect` and `$inferInsert`
