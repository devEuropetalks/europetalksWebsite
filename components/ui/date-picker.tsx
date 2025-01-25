"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DatePicker({
  date,
  setDate,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = React.useCallback(
    (selectedDate: Date | undefined) => {
      if (selectedDate) {
        // Preserve the time when selecting a new date
        const newDate = new Date(selectedDate);
        if (date) {
          newDate.setHours(date.getHours(), date.getMinutes());
        }
        setDate(newDate);
        setIsOpen(false);
      }
    },
    [date, setDate]
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              setIsOpen(true);
            }
          }}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          selected={date}
          onSelect={handleSelect}
          initialFocus
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
