"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface SafeSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function SafeSelect({ value, onValueChange, options, placeholder, className }: SafeSelectProps) {
  const [mounted, setMounted] = useState(false)
  const [safeValue, setSafeValue] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Vérifier que la valeur existe dans les options ou est vide (pour "Tous")
    if (value === "" || (value && options.some(opt => opt.value === value))) {
      setSafeValue(value)
    } else {
      // Si la valeur n'existe plus dans les options, réinitialiser
      setSafeValue("")
      if (value && value !== "") {
        // Notifier le parent que la valeur a changé seulement si ce n'était pas déjà vide
        onValueChange("")
      }
    }
  }, [value, options, onValueChange])

  if (!mounted || !options || options.length === 0) {
    return (
      <div className={className}>
        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
          <span className="text-muted-foreground">{placeholder || "Chargement..."}</span>
        </div>
      </div>
    )
  }

  const validOptions = options.filter(opt => opt.value != null && opt.value !== undefined && opt.value !== "")

  if (validOptions.length === 0) {
    return null
  }

  // Utiliser "__all__" comme valeur spéciale pour "Tous" au lieu de ""
  const ALL_VALUE = "__all__"
  const displayValue = safeValue === "" ? ALL_VALUE : safeValue

  return (
    <div className={className}>
      <Select
        value={displayValue}
        onValueChange={(newValue) => {
          const actualValue = newValue === ALL_VALUE ? "" : newValue
          setSafeValue(actualValue)
          onValueChange(actualValue)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Tous</SelectItem>
          {validOptions.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
