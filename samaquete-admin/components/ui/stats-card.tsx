"use client"

import { Card, CardContent } from "./card"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  iconColor?: string
  className?: string
  tooltip?: string // Nombre réel à afficher au survol
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor = "text-amber-600",
  className,
  tooltip
}: StatsCardProps) {
  return (
    <Card className={cn("bg-white rounded-xl shadow-sm border border-gray-200 group hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="relative">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {tooltip && (
                <div className="absolute -top-10 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {tooltip}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center", iconColor.replace("text-", "bg-").replace("-600", "-100"))}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
