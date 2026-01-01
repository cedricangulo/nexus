"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface NaturalDateInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseISODate(isoString: string): Date | undefined {
  if (!isoString) return undefined
  try {
    const date = new Date(isoString)
    return isNaN(date.getTime()) ? undefined : date
  } catch {
    return undefined
  }
}

export function NaturalDateInput({
  value,
  onChange,
  placeholder = "Tomorrow or next week",
  disabled = false,
  id,
  className,
}: NaturalDateInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [date, setDate] = React.useState<Date | undefined>(
    parseISODate(value)
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)

  // Sync with external value prop
  React.useEffect(() => {
    const parsedDate = parseISODate(value)
    setDate(parsedDate)
    setMonth(parsedDate)
  }, [value])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <Input
          id={id}
          value={inputValue}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          onChange={(e) => {
            const newValue = e.target.value
            setInputValue(newValue)
            
            // Try to parse natural language date
            const parsedDate = parseDate(newValue)
            if (parsedDate) {
              setDate(parsedDate)
              setMonth(parsedDate)
              onChange(formatDateToISO(parsedDate))
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
              // Direct ISO format input
              const isoDate = parseISODate(newValue)
              if (isoDate) {
                setDate(isoDate)
                setMonth(isoDate)
              }
              onChange(newValue)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              id="date-picker"
              variant="ghost"
              disabled={disabled}
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(selectedDate: Date | undefined) => {
                if (selectedDate) {
                  setDate(selectedDate)
                  setMonth(selectedDate)
                  const isoDate = formatDateToISO(selectedDate)
                  onChange(isoDate)
                  setInputValue(formatDate(selectedDate))
                }
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-muted-foreground px-1 text-sm">
        Your date {" "}
        <span className="font-medium">{formatDate(date)}</span>.
      </div>
    </div>
  )
}
