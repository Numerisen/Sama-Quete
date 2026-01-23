"use client"

import { List, Grid } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export type ViewMode = "list" | "cards"

interface ViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  className?: string
}

export function ViewToggle({ viewMode, onViewModeChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 border rounded-lg p-1 bg-white", className)}>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className={cn(
          "h-8 px-3",
          viewMode === "list" && "bg-amber-600 hover:bg-amber-700 text-white"
        )}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("cards")}
        className={cn(
          "h-8 px-3",
          viewMode === "cards" && "bg-amber-600 hover:bg-amber-700 text-white"
        )}
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  )
}
