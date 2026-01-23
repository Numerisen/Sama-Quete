"use client"

import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Search, X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface FilterConfig {
  type: "text" | "select"
  key: string
  label: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface FiltersBarProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onClear: () => void
  className?: string
}

export function FiltersBar({ filters, values, onChange, onClear, className }: FiltersBarProps) {
  const hasActiveFilters = Object.values(values).some(v => v && v !== "")

  return (
    <div className={cn("flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-200", className)}>
      {filters.map((filter) => {
        if (filter.type === "text") {
          return (
            <div key={filter.key} className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={filter.placeholder || `Rechercher par ${filter.label.toLowerCase()}...`}
                  value={values[filter.key] || ""}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )
        }

        if (filter.type === "select") {
          return (
            <div key={filter.key} className="min-w-[180px]">
              <Select
                value={values[filter.key] || ""}
                onValueChange={(value) => onChange(filter.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }

        return null
      })}

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}
