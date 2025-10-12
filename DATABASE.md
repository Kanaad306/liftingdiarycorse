# Database Setup Guide

## Overview

This project uses **Drizzle ORM** with **Neon Postgres** for database management. Drizzle provides type-safe database queries and Neon offers serverless Postgres hosting.

## Initial Setup

### 1. Get Your Neon Database URL

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project (or use existing)
3. Navigate to **Connection Details**
4. Copy your connection string (should look like):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Add Database URL to Environment

Update your `.env.local` file:

```bash
DATABASE_URL=postgresql://your-connection-string-here
```

### 3. Push Schema to Database

Run the following command to create tables in your database:

```bash
npm run db:push
```

This will create the following tables:
- `users` - User profiles (integrated with Clerk)
- `workouts` - Workout sessions
- `exercises` - Individual exercises within workouts

## Database Scripts

### `npm run db:push`
**Recommended for development** - Directly pushes schema changes to the database without generating migration files. Fast and convenient for rapid iteration.

### `npm run db:generate`
Generates SQL migration files based on schema changes. Use this for production workflows.

### `npm run db:migrate`
Applies generated migration files to the database.

### `npm run db:studio`
Opens Drizzle Studio - a web-based database browser at `https://local.drizzle.studio`

## Database Schema

### Users Table
```typescript
{
  id: number (auto-increment)
  clerkId: string (unique) - Links to Clerk authentication
  name: string
  email: string (unique)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Workouts Table
```typescript
{
  id: number (auto-increment)
  userId: number (foreign key -> users.id)
  name: string
  notes: text (optional)
  workoutDate: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Exercises Table
```typescript
{
  id: number (auto-increment)
  workoutId: number (foreign key -> workouts.id)
  name: string
  sets: number
  reps: number
  weight: number (optional)
  notes: text (optional)
  createdAt: timestamp
}
```

## Usage Examples

### Importing the Database Client

```typescript
import { db } from "@/db";
import { usersTable, workoutsTable, exercisesTable } from "@/db/schema";
```

### Server Component Example

```typescript
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  // Query user from database
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, userId))
    .limit(1);

  return <div>Welcome {user[0]?.name}</div>;
}
```

### API Route Example

```typescript
import { db } from "@/db";
import { workoutsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Insert new workout
  const workout = await db
    .insert(workoutsTable)
    .values({
      userId: body.userId,
      name: body.name,
      notes: body.notes,
      workoutDate: new Date(),
    })
    .returning();

  return NextResponse.json(workout[0]);
}
```

### Create User on Sign Up (Webhook Example)

```typescript
import { db } from "@/db";
import { usersTable } from "@/db/schema";

// In your Clerk webhook handler
const newUser = await db
  .insert(usersTable)
  .values({
    clerkId: clerkUser.id,
    name: clerkUser.firstName + " " + clerkUser.lastName,
    email: clerkUser.emailAddresses[0].emailAddress,
  })
  .returning();
```

## Common Drizzle Operations

### Select (Query)
```typescript
// Get all workouts
const workouts = await db.select().from(workoutsTable);

// Get specific workout
import { eq } from "drizzle-orm";
const workout = await db
  .select()
  .from(workoutsTable)
  .where(eq(workoutsTable.id, 1));
```

### Insert
```typescript
const newWorkout = await db
  .insert(workoutsTable)
  .values({
    userId: 1,
    name: "Leg Day",
    workoutDate: new Date(),
  })
  .returning();
```

### Update
```typescript
import { eq } from "drizzle-orm";

await db
  .update(workoutsTable)
  .set({ name: "Updated Leg Day" })
  .where(eq(workoutsTable.id, 1));
```

### Delete
```typescript
import { eq } from "drizzle-orm";

await db
  .delete(workoutsTable)
  .where(eq(workoutsTable.id, 1));
```

### Joins
```typescript
import { eq } from "drizzle-orm";

const workoutsWithExercises = await db
  .select()
  .from(workoutsTable)
  .leftJoin(exercisesTable, eq(workoutsTable.id, exercisesTable.workoutId))
  .where(eq(workoutsTable.userId, userId));
```

## Production Workflow

For production, use migrations instead of `db:push`:

1. Make changes to `src/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review generated SQL in `drizzle/` folder
4. Apply migration: `npm run db:migrate`

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle with Next.js](https://orm.drizzle.team/docs/get-started/nextjs)
- [Clerk + Drizzle Integration](https://clerk.com/docs)

## Troubleshooting

### Error: "DATABASE_URL is not defined"
Make sure you've added `DATABASE_URL` to your `.env.local` file.

### Node version warning for @neondatabase/serverless
The package prefers Node.js >=19, but will work with Node 18. Consider upgrading to Node 20+ for best compatibility.

### Migrations not applying
Try `npm run db:push` for direct schema sync, or regenerate migrations with `npm run db:generate`.
