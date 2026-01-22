"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getPrayers } from "@/lib/firestore/services"
import { Prayer, ContentStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function PrayersPage() {
  const { claims } = useAuth()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPrayers()
  }, [claims])

  async function loadPrayers() {
    try {
      const data = await getPrayers(claims?.parishId, claims?.dioceseId)
      setPrayers(data)
    } catch (error) {
      console.error("Erreur chargement prières:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: ContentStatus) => {
    const variants: Record<ContentStatus, string> = {
      draft: "bg-gray-500",
      pending: "bg-yellow-500",
      published: "bg-green-500",
    }
    return (
      <Badge className={variants[status]}>
        {status === "draft" ? "Brouillon" : status === "pending" ? "En attente" : "Publié"}
      </Badge>
    )
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prières</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des prières
          </p>
        </div>
        {claims?.role === "church_admin" && (
          <Link href="/admin/prayers/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle prière
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {prayers.map((prayer) => (
          <Card key={prayer.prayerId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{prayer.title}</CardTitle>
                {getStatusBadge(prayer.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prayer.content}
              </p>
              {prayer.category && (
                <Badge variant="outline" className="mt-2">
                  {prayer.category}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
