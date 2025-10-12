import { integer, pgTable, varchar, timestamp, text, numeric, boolean } from "drizzle-orm/pg-core";

/**
 * Users table - extends Clerk authentication with additional profile data
 * The clerkId field connects to Clerk's user management
 */
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * Workouts table - stores workout sessions
 */
export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  notes: text(),
  startedAt: timestamp().notNull().defaultNow(),
  completedAt: timestamp(),
  duration: integer(), // duration in minutes (optional, can be calculated from startedAt/completedAt)
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * Exercises table - stores individual exercises within a workout
 * Each exercise can have multiple sets (tracked in setsTable)
 */
export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer()
    .notNull()
    .references(() => workoutsTable.id, { onDelete: "cascade" }),
  exerciseName: varchar({ length: 255 }).notNull(), // e.g., "Bench Press", "Squat", "Deadlift"
  exerciseOrder: integer().notNull().default(0), // order of exercise in workout (1, 2, 3, etc.)
  notes: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * Sets table - stores individual sets for each exercise
 * This allows tracking multiple sets per exercise with detailed per-set data
 */
export const setsTable = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  exerciseId: integer()
    .notNull()
    .references(() => exercisesTable.id, { onDelete: "cascade" }),
  setNumber: integer().notNull(), // 1, 2, 3, etc.
  reps: integer().notNull(),
  weight: numeric({ precision: 10, scale: 2 }), // allows decimal weights like 135.5
  weightUnit: varchar({ length: 10 }).notNull().default("lbs"), // 'lbs' or 'kg'
  rpe: integer(), // Rate of Perceived Exertion (1-10, optional)
  rir: integer(), // Reps in Reserve (optional)
  isWarmup: boolean().notNull().default(false),
  notes: text(),
  createdAt: timestamp().notNull().defaultNow(),
});

// Type exports for TypeScript
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export type Workout = typeof workoutsTable.$inferSelect;
export type InsertWorkout = typeof workoutsTable.$inferInsert;

export type Exercise = typeof exercisesTable.$inferSelect;
export type InsertExercise = typeof exercisesTable.$inferInsert;

export type Set = typeof setsTable.$inferSelect;
export type InsertSet = typeof setsTable.$inferInsert;
