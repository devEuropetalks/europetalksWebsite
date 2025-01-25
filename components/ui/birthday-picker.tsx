"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BirthdayPickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
}

export function BirthdayPicker({
  date,
  onSelect,
  placeholder = "Pick a date",
}: BirthdayPickerProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<number>(
    date ? date.getMonth() : new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(
    date ? date.getFullYear() : new Date().getFullYear() - 20
  );

  // Generate array of years from 100 years ago to current year
  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - i);
  }, []);

  // Generate array of month names
  const months = React.useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  const handleMonthChange = (value: string) => {
    const monthIndex = months.indexOf(value);
    setSelectedMonth(monthIndex);

    // Update the date when month changes
    if (date) {
      const newDate = new Date(date);
      newDate.setMonth(monthIndex);
      onSelect(newDate);
    }
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    setSelectedYear(year);

    // Update the date when year changes
    if (date) {
      const newDate = new Date(date);
      newDate.setFullYear(year);
      onSelect(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex gap-2 p-3">
          <Select
            value={months[selectedMonth]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedYear.toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={date}
          month={new Date(selectedYear, selectedMonth)}
          onSelect={onSelect}
          defaultMonth={new Date(selectedYear, selectedMonth)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
