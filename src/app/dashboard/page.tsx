"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock workout data for UI display
const mockWorkouts = [
  {
    id: 1,
    name: "Morning Chest & Triceps",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 10, weight: 185 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 12, weight: 70 },
      { name: "Tricep Dips", sets: 3, reps: 15, weight: 0 },
    ],
    duration: 65,
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Evening Back & Biceps",
    exercises: [
      { name: "Deadlifts", sets: 5, reps: 5, weight: 315 },
      { name: "Pull-ups", sets: 4, reps: 8, weight: 0 },
      { name: "Barbell Curls", sets: 3, reps: 12, weight: 75 },
    ],
    duration: 55,
    createdAt: new Date(),
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "do MMM yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="text-sm text-muted-foreground">
            Showing workouts for {format(date, "do MMM yyyy")}
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-4">
          {mockWorkouts.length === 0 ? (
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
            mockWorkouts.map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        {workout.name}
                      </CardTitle>
                      <CardDescription>
                        {workout.exercises.length} exercises • {workout.duration} minutes
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(workout.createdAt, "do MMM yyyy")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {workout.exercises.map((exercise, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-l-2 border-primary pl-4 py-2"
                      >
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight > 0 && ` @ ${exercise.weight} lbs`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
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
              <div className="text-2xl font-bold">{mockWorkouts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                on {format(date, "do MMM yyyy")}
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
              <div className="text-2xl font-bold">
                {mockWorkouts.reduce((sum, w) => sum + w.exercises.length, 0)}
              </div>
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
                {mockWorkouts.reduce((sum, w) => sum + w.duration, 0)} min
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
