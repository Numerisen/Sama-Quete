"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getChurches } from "@/lib/firestore/services"
import { Church } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ChurchesPage() {
  const { claims } = useAuth()
  const [churches, setChurches] = useState<Church[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChurches()
  }, [claims])

  async function loadChurches() {
    try {
      const data = await getChurches(claims?.parishId, claims?.dioceseId)
      setChurches(data)
    } catch (error) {
      console.error("Erreur chargement églises:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Églises</h1>
          <p className="text-muted-foreground mt-2">
            Liste des églises (internes)
          </p>
        </div>
        {(claims?.role === "super_admin" || 
          claims?.role === "diocese_admin" || 
          claims?.role === "parish_admin") && (
          <Link href="/admin/churches/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle église
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {churches.map((church) => (
          <Card key={church.churchId}>
            <CardHeader>
              <CardTitle>{church.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ID: {church.churchId}
              </p>
              <p className="text-sm text-muted-foreground">
                Paroisse: {church.parishId}
              </p>
              <p className={`text-sm mt-2 ${church.isActive ? "text-green-600" : "text-red-600"}`}>
                {church.isActive ? "Active" : "Inactive"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
