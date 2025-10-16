import { db } from "@/db";
import { workoutsTable, usersTable } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStartOfDay, getEndOfDay } from "@/lib/date-utils";

/**
 * Get the database user ID from the authenticated Clerk user
 * Creates the user in the database if they don't exist yet
 * @returns The database user ID
 * @throws Error if user is not authenticated
 */
async function getAuthenticatedUserId(): Promise<number> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  // Find the user in our database by their Clerk ID
  let user = await db.query.usersTable.findFirst({
    where: eq(usersTable.clerkId, clerkUserId),
  });

  // If user doesn't exist in our database, create them
  if (!user) {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      throw new Error("Unauthorized");
    }

    // Get the user's email and name from Clerk
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = clerkUser.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
      : email?.split('@')[0] || 'User';

    if (!email) {
      throw new Error("User email not found");
    }

    // Create the user in our database
    const [newUser] = await db.insert(usersTable).values({
      clerkId: clerkUserId,
      email,
      name,
    }).returning();

    user = newUser;

    console.log('[getAuthenticatedUserId] Created new user:', {
      id: user.id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
    });
  }

  return user.id;
}

/**
 * Get all workouts for the authenticated user on a specific date
 * @param date The date to filter workouts by (should be at midnight local time)
 * @returns Array of workouts with their exercises and sets
 */
export async function getWorkoutsByDate(date: Date) {
  const userId = await getAuthenticatedUserId();

  // Get start and end of day for the given date
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);

  console.log('[getWorkoutsByDate] Searching for workouts:', {
    userId,
    date: date.toISOString(),
    startOfDay: startOfDay.toISOString(),
    endOfDay: endOfDay.toISOString(),
  });

  const workouts = await db.query.workoutsTable.findMany({
    where: and(
      eq(workoutsTable.userId, userId),
      gte(workoutsTable.startedAt, startOfDay),
      lte(workoutsTable.startedAt, endOfDay)
    ),
    orderBy: [desc(workoutsTable.startedAt)],
    with: {
      exercises: {
        orderBy: (exercises, { asc }) => [asc(exercises.exerciseOrder)],
        with: {
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  console.log('[getWorkoutsByDate] Found workouts:', workouts.length);

  return workouts;
}

/**
 * Get workout statistics for the authenticated user on a specific date
 * @param date The date to get stats for (should be at midnight local time)
 * @returns Object containing total workouts, exercises, and duration
 */
export async function getWorkoutStatsByDate(date: Date) {
  const userId = await getAuthenticatedUserId();

  // Get start and end of day for the given date
  const startOfDay = getStartOfDay(date);
  const endOfDay = getEndOfDay(date);

  const workouts = await db.query.workoutsTable.findMany({
    where: and(
      eq(workoutsTable.userId, userId),
      gte(workoutsTable.startedAt, startOfDay),
      lte(workoutsTable.startedAt, endOfDay)
    ),
    with: {
      exercises: true,
    },
  });

  const totalWorkouts = workouts.length;
  const totalExercises = workouts.reduce(
    (sum, workout) => sum + (workout.exercises?.length || 0),
    0
  );
  const totalDuration = workouts.reduce(
    (sum, workout) => sum + (workout.duration || 0),
    0
  );

  console.log('[getWorkoutStatsByDate] Stats:', {
    totalWorkouts,
    totalExercises,
    totalDuration,
  });

  return {
    totalWorkouts,
    totalExercises,
    totalDuration,
  };
}

/**
 * Get all workouts for the authenticated user (for general listing)
 * @returns Array of workouts with their exercises
 */
export async function getUserWorkouts() {
  const userId = await getAuthenticatedUserId();

  return await db.query.workoutsTable.findMany({
    where: eq(workoutsTable.userId, userId),
    orderBy: [desc(workoutsTable.startedAt)],
    with: {
      exercises: {
        orderBy: (exercises, { asc }) => [asc(exercises.exerciseOrder)],
        with: {
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
  });
}
