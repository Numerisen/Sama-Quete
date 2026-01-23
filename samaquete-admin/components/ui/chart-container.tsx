"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { ReactNode } from "react"

interface ChartContainerProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartContainer({ title, icon, children, className }: ChartContainerProps) {
  return (
    <Card className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className || ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          {icon && <span className="text-amber-600">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
