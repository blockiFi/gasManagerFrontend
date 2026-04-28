"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarDays } from "lucide-react"

const DEFAULT_FROM_YEAR = 1995

/**
 * Popover calendar with month/year dropdowns (react-day-picker v8).
 * Use inside dialogs with modal={false} on the root Popover to avoid focus conflicts.
 */
export function DatePickerField({
  value,
  onChange,
  disabled = false,
  placeholder = "Pick a date",
  className,
  id,
  fromYear = DEFAULT_FROM_YEAR,
  toYear = new Date().getFullYear() + 8,
  align = "start",
  compact = false,
}) {
  const safe =
    value instanceof Date && !Number.isNaN(value.getTime()) ? value : undefined
  const label = safe ? format(safe, compact ? "MMM d, yyyy" : "PPP") : null

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-start border-slate-200 bg-white text-left font-normal text-slate-900 shadow-sm hover:bg-slate-50",
            !label && "text-muted-foreground",
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          <span className="truncate">{label ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align} sideOffset={6}>
        <Calendar
          mode="single"
          selected={safe}
          onSelect={(d) => {
            if (d) onChange?.(d)
          }}
          initialFocus
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          defaultMonth={safe ?? new Date()}
          className="rounded-md border-0 shadow-none"
        />
      </PopoverContent>
    </Popover>
  )
}
