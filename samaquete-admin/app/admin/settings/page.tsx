"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground mt-2">
          Configuration de l'application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres généraux</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fonctionnalité à implémenter
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
