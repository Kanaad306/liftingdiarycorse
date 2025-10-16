# Data Fetching Guidelines

This document outlines the **mandatory** data fetching patterns for this application. These are architectural decisions that **MUST** be followed without exception.

---

## 🚨 Critical Rules

### 1. **Server Components Only**

**ALL data fetching MUST be done in Server Components.**

- ✅ **DO**: Fetch data in Server Components (default in Next.js App Router)
- ❌ **DON'T**: Fetch data in Client Components
- ❌ **DON'T**: Create API Route Handlers (`app/api/*/route.ts`) for data fetching

**Why?**
- Server Components provide better performance (no client-side JavaScript)
- Automatic request deduplication and caching
- Direct database access without additional API layer
- Reduced bundle size and faster page loads
- Better SEO and initial page load performance

---

### 2. **No Route Handlers for Data Fetching**

**Route Handlers (`app/api/*/route.ts`) should NOT be created for data fetching purposes.**

Route Handlers should only be used for:
- Webhooks from external services (e.g., Clerk, Stripe)
- Form submissions that require special handling
- External API integrations that need server-side proxying

For all internal data needs, use Server Components directly.

---

### 3. **Database Queries via Helper Functions**

**All database queries MUST be encapsulated in helper functions within the `/data` directory.**

#### Structure

```
src/
  data/
    user.ts          # User-related data fetching functions
    workout.ts       # Workout-related data fetching functions
    exercise.ts      # Exercise-related data fetching functions
```

#### Pattern

```typescript
// src/data/workout.ts
import { db } from "@/db";
import { workoutsTable, exercisesTable } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getUserWorkouts() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await db.query.workoutsTable.findMany({
    where: eq(workoutsTable.userId, userId),
    orderBy: [desc(workoutsTable.createdAt)],
    with: {
      exercises: true,
    },
  });
}

export async function getWorkoutById(workoutId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const workout = await db.query.workoutsTable.findFirst({
    where: and(
      eq(workoutsTable.id, workoutId),
      eq(workoutsTable.userId, userId)
    ),
    with: {
      exercises: true,
    },
  });

  if (!workout) {
    throw new Error("Workout not found");
  }

  return workout;
}
```

---

### 4. **Use Drizzle ORM - NO Raw SQL**

**All database operations MUST use Drizzle ORM query builder. Raw SQL is prohibited.**

#### ✅ Correct (Drizzle ORM)

```typescript
import { db } from "@/db";
import { workoutsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const workouts = await db
  .select()
  .from(workoutsTable)
  .where(eq(workoutsTable.userId, userId));
```

#### ❌ Wrong (Raw SQL)

```typescript
const workouts = await db.execute(
  sql`SELECT * FROM workouts WHERE user_id = ${userId}`
);
```

**Why?**
- Type safety at compile time
- Better IDE autocomplete and IntelliSense
- Protection against SQL injection
- Easier refactoring when schema changes
- Consistent code patterns across the application

---

### 5. **Data Access Security**

**Users can ONLY access their own data. Every query MUST enforce this.**

#### Security Pattern

Every data fetching function MUST:

1. **Authenticate** the user using `auth()` from Clerk
2. **Filter** queries by the authenticated user's ID
3. **Verify** ownership before returning data

```typescript
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workoutsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutById(workoutId: number) {
  // 1. Authenticate
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Filter by user ID (CRITICAL!)
  const workout = await db.query.workoutsTable.findFirst({
    where: and(
      eq(workoutsTable.id, workoutId),
      eq(workoutsTable.userId, userId)  // ← ALWAYS include this
    ),
  });

  // 3. Verify ownership
  if (!workout) {
    throw new Error("Workout not found or access denied");
  }

  return workout;
}
```

#### Common Security Mistakes to Avoid

❌ **DON'T** fetch all data and filter client-side:
```typescript
// WRONG - Security vulnerability!
const allWorkouts = await db.select().from(workoutsTable);
return allWorkouts.filter(w => w.userId === userId);
```

❌ **DON'T** skip user authentication:
```typescript
// WRONG - No auth check!
export async function getWorkoutById(workoutId: number) {
  return await db.query.workoutsTable.findFirst({
    where: eq(workoutsTable.id, workoutId),
  });
}
```

❌ **DON'T** trust client-provided user IDs:
```typescript
// WRONG - User ID from client can be manipulated!
export async function getWorkouts(userId: string) {
  return await db.query.workoutsTable.findMany({
    where: eq(workoutsTable.userId, userId),
  });
}
```

---

## Implementation Examples

### Example 1: Fetching Data in a Server Component

```typescript
// app/workouts/page.tsx (Server Component)
import { getUserWorkouts } from "@/data/workout";

export default async function WorkoutsPage() {
  const workouts = await getUserWorkouts();

  return (
    <div>
      <h1>My Workouts</h1>
      {workouts.map((workout) => (
        <div key={workout.id}>
          <h2>{workout.name}</h2>
          <p>{workout.date}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Fetching Data with Dynamic Params

```typescript
// app/workouts/[id]/page.tsx (Server Component)
import { getWorkoutById } from "@/data/workout";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkoutDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const workout = await getWorkoutById(parseInt(id));

    return (
      <div>
        <h1>{workout.name}</h1>
        <p>Date: {workout.date}</p>
        <h2>Exercises</h2>
        {workout.exercises?.map((exercise) => (
          <div key={exercise.id}>
            <p>{exercise.name}: {exercise.sets} sets × {exercise.reps} reps</p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    notFound();
  }
}
```

### Example 3: Creating Helper Functions with Relations

```typescript
// src/data/workout.ts
import { db } from "@/db";
import { workoutsTable, exercisesTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getUserWorkoutsWithExercises() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Using Drizzle's relational query API
  return await db.query.workoutsTable.findMany({
    where: eq(workoutsTable.userId, userId),
    orderBy: [desc(workoutsTable.createdAt)],
    with: {
      exercises: {
        orderBy: [exercisesTable.order],
      },
    },
  });
}

export async function getWorkoutStats() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const workouts = await db.query.workoutsTable.findMany({
    where: eq(workoutsTable.userId, userId),
    with: {
      exercises: true,
    },
  });

  return {
    totalWorkouts: workouts.length,
    totalExercises: workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0),
  };
}
```

### Example 4: Mutations with Server Actions

For mutations (create, update, delete), use Server Actions:

```typescript
// app/workouts/actions.ts
"use server";

import { db } from "@/db";
import { workoutsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createWorkout(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;
  const date = formData.get("date") as string;

  await db.insert(workoutsTable).values({
    userId,
    name,
    date: new Date(date),
  });

  revalidatePath("/workouts");
}

export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify ownership before deleting
  const workout = await db.query.workoutsTable.findFirst({
    where: and(
      eq(workoutsTable.id, workoutId),
      eq(workoutsTable.userId, userId)
    ),
  });

  if (!workout) {
    throw new Error("Workout not found or access denied");
  }

  await db.delete(workoutsTable).where(eq(workoutsTable.id, workoutId));

  revalidatePath("/workouts");
}
```

---

## Directory Structure

Your data fetching code should follow this structure:

```
src/
  app/
    workouts/
      page.tsx           # Server Component (fetches data)
      [id]/
        page.tsx         # Server Component (fetches data)
      actions.ts         # Server Actions (mutations)
  data/
    user.ts              # User data fetching functions
    workout.ts           # Workout data fetching functions
    exercise.ts          # Exercise data fetching functions
  db/
    schema.ts            # Database schema
    index.ts             # Database client
```

---

## Checklist for Data Fetching

Before implementing any data fetching, verify:

- [ ] Am I using a Server Component? (default in App Router)
- [ ] Am I NOT creating an API Route Handler for this?
- [ ] Have I created a helper function in `/data` directory?
- [ ] Am I using Drizzle ORM (not raw SQL)?
- [ ] Have I authenticated the user with `auth()`?
- [ ] Am I filtering data by the authenticated user's ID?
- [ ] Have I verified ownership before returning sensitive data?

---

## Common Patterns

### Pattern: Loading States

```typescript
// app/workouts/loading.tsx
export default function Loading() {
  return <div>Loading workouts...</div>;
}
```

### Pattern: Error Handling

```typescript
// app/workouts/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Pattern: Streaming with Suspense

```typescript
// app/workouts/page.tsx
import { Suspense } from "react";
import WorkoutList from "@/components/WorkoutList";

export default function WorkoutsPage() {
  return (
    <div>
      <h1>My Workouts</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <WorkoutList />
      </Suspense>
    </div>
  );
}

// components/WorkoutList.tsx (Server Component)
import { getUserWorkouts } from "@/data/workout";

export default async function WorkoutList() {
  const workouts = await getUserWorkouts();

  return (
    <ul>
      {workouts.map((workout) => (
        <li key={workout.id}>{workout.name}</li>
      ))}
    </ul>
  );
}
```

---

## Summary

- ✅ **Server Components** for all data fetching
- ❌ **No Route Handlers** for data fetching
- ❌ **No Client Components** for data fetching
- ✅ **Helper functions** in `/data` directory
- ✅ **Drizzle ORM** (no raw SQL)
- ✅ **User authentication** on every query
- ✅ **Data filtering** by authenticated user ID
- ✅ **Ownership verification** before returning data

**Remember: These are not suggestions—they are mandatory architectural decisions for this application.**
