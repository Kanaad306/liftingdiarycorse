import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Database connection setup for Neon using HTTP
 * This is optimized for serverless environments and Edge runtime
 */

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not defined. Please add it to your .env.local file"
  );
}

// Create Neon HTTP client
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle instance with schema
export const db = drizzle({ client: sql, schema });

// Re-export schema for convenience
export * from "./schema";
