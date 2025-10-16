"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateToYYYYMMDD } from "@/lib/date-utils";

interface DatePickerClientProps {
  selectedDate: Date;
}

export function DatePickerClient({ selectedDate }: DatePickerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [date, setDate] = useState<Date>(selectedDate);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;

    // Validate that we have a valid date
    if (isNaN(newDate.getTime())) {
      console.error('[DatePicker] Invalid date selected:', newDate);
      return;
    }

    setDate(newDate);

    // Format date as YYYY-MM-DD to avoid timezone issues
    const dateString = formatDateToYYYYMMDD(newDate);

    // Update URL search params to trigger server-side data fetch
    const params = new URLSearchParams(searchParams);
    params.set("date", dateString);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
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
          onSelect={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
}
