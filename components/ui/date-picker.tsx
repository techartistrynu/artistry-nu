// components/ui/date-picker.tsx
"use client"

import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function DatePicker({
  id,
  selected,
  onSelect,
  required = false,
  minDate,
  maxDate,
  fromYear,
  toYear,
}: {
  id: string
  selected?: Date
  onSelect: (date?: Date) => void
  required?: boolean
  minDate?: Date
  maxDate?: Date
  fromYear?: number
  toYear?: number
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarUI
          id={id}
          mode="single"
          selected={selected}
          onSelect={onSelect}
          required={required}
          initialFocus
          fromYear={fromYear}
          toYear={toYear}
        //   minDate={minDate}
        //   maxDate={maxDate}
        />
      </PopoverContent>
    </Popover>
  )
}