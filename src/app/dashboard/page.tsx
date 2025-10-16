import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getWorkoutsByDate, getWorkoutStatsByDate } from "@/data/workout";
import { DatePickerClient } from "./date-picker-client";
import { parseDateFromYYYYMMDD, getTodayAtMidnight } from "@/lib/date-utils";

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse date from search params (YYYY-MM-DD format) or use today
  let selectedDate: Date;

  if (params.date) {
    const parsedDate = parseDateFromYYYYMMDD(params.date);

    if (parsedDate) {
      selectedDate = parsedDate;
      console.log('[Dashboard] Date from params:', {
        paramDate: params.date,
        parsedDate: selectedDate.toISOString(),
        localDate: selectedDate.toLocaleDateString(),
      });
    } else {
      // Invalid date, fall back to today
      console.warn('[Dashboard] Invalid date in params, using today:', params.date);
      selectedDate = getTodayAtMidnight();
    }
  } else {
    // Use today at midnight
    selectedDate = getTodayAtMidnight();
    console.log('[Dashboard] Using today:', selectedDate.toISOString());
  }

  // Fetch workouts and stats for the selected date
  const [workouts, stats] = await Promise.all([
    getWorkoutsByDate(selectedDate),
    getWorkoutStatsByDate(selectedDate),
  ]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your workouts and progress
          </p>
        </div>

        {/* Date Picker Section */}
        <div className="mb-6 flex items-center gap-4">
          <DatePickerClient selectedDate={selectedDate} />
          <div className="text-sm text-muted-foreground">
            Showing workouts for {format(selectedDate, "do MMM yyyy")}
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No workouts logged for this date
                </p>
                <Button className="mt-4">Log a Workout</Button>
              </CardContent>
            </Card>
          ) : (
            workouts.map((workout) => {
              // Calculate total sets for display
              const totalSets = workout.exercises?.reduce(
                (sum, exercise) => sum + (exercise.sets?.length || 0),
                0
              ) || 0;

              return (
                <Card key={workout.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Dumbbell className="h-5 w-5" />
                          {workout.name}
                        </CardTitle>
                        <CardDescription>
                          {workout.exercises?.length || 0} exercises • {totalSets} sets
                          {workout.duration && ` • ${workout.duration} minutes`}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(workout.startedAt), "h:mm a")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workout.exercises?.map((exercise) => {
                        // Get non-warmup sets for display
                        const workingSets = exercise.sets?.filter(s => !s.isWarmup) || [];

                        return (
                          <div
                            key={exercise.id}
                            className="flex items-center justify-between border-l-2 border-primary pl-4 py-2"
                          >
                            <div>
                              <p className="font-medium">{exercise.exerciseName}</p>
                              <p className="text-sm text-muted-foreground">
                                {workingSets.length} {workingSets.length === 1 ? 'set' : 'sets'}
                                {workingSets.length > 0 && (
                                  <>
                                    {' × '}
                                    {workingSets[0].reps} reps
                                    {workingSets[0].weight && (
                                      <> @ {workingSets[0].weight} {workingSets[0].weightUnit}</>
                                    )}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {workout.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">{workout.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                on {format(selectedDate, "do MMM yyyy")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Exercises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExercises}</div>
              <p className="text-xs text-muted-foreground mt-1">
                completed today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalDuration} min
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                training time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
