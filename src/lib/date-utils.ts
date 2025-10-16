/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Format a Date object to YYYY-MM-DD string
 * @param date Date object to format
 * @returns YYYY-MM-DD formatted string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object at midnight local time
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object at midnight or null if invalid
 */
export function parseDateFromYYYYMMDD(dateString: string): Date | null {
  // Validate format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return null;
  }

  // Parse and validate date
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Check if valid date
  if (isNaN(date.getTime())) {
    return null;
  }

  // Ensure we're at midnight
  date.setHours(0, 0, 0, 0);

  return date;
}

/**
 * Get today's date at midnight local time
 * @returns Date object set to midnight
 */
export function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get the start of day (00:00:00.000) for a given date
 * @param date Date to get start of day for
 * @returns Date at 00:00:00.000
 */
export function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the end of day (23:59:59.999) for a given date
 * @param date Date to get end of day for
 * @returns Date at 23:59:59.999
 */
export function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}
