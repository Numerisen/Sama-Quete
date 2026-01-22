"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground mt-2">
          Gestion des utilisateurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
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
