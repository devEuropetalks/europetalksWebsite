"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Simple phone input that doesn't rely on problematic imports
export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    value?: string;
    onChange?: (value: string) => void;
    defaultCountry?: string;
  }
>(({ className, onChange, value, defaultCountry = "DE", ...props }, ref) => {
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Only allow digits, spaces, and + character
    if (/^[0-9\s+]*$/.test(newValue) || newValue === '') {
      onChange?.(newValue);
    }
  };

  return (
    <div className={cn("flex", className)}>
      <Button
        type="button"
        variant="outline"
        className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3"
        disabled={props.disabled}
      >
        <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
          {defaultCountry === "DE" && "🇩🇪"}
          {defaultCountry === "AT" && "🇦🇹"}
          {defaultCountry === "CH" && "🇨🇭"}
          {defaultCountry === "FR" && "🇫🇷"}
          {defaultCountry === "IT" && "🇮🇹"}
          {defaultCountry === "ES" && "🇪🇸"}
          {defaultCountry === "GB" && "🇬🇧"}
          {defaultCountry === "US" && "🇺🇸"}
          {!["DE", "AT", "CH", "FR", "IT", "ES", "GB", "US"].includes(defaultCountry) && "🌍"}
        </span>
        <ChevronsUpDown className="-mr-2 size-4 opacity-50" />
      </Button>
      <Input
        ref={ref}
        type="tel"
        className="rounded-e-lg rounded-s-none"
        value={value}
        onChange={handleChange}
        placeholder="Phone number"
        {...props}
      />
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";
