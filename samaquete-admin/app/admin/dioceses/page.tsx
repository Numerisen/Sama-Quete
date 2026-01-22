"use client"

import { useEffect, useState } from "react"
import { getDioceses, createDiocese } from "@/lib/firestore/services"
import { Diocese, FIXED_DIOCESES } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function DiocesesPage() {
  const [dioceses, setDioceses] = useState<Diocese[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDioceses()
  }, [])

  async function loadDioceses() {
    try {
      const data = await getDioceses()
      setDioceses(data)
    } catch (error) {
      console.error("Erreur chargement diocèses:", error)
    } finally {
      setLoading(false)
    }
  }

  async function seedDioceses() {
    try {
      for (const diocese of FIXED_DIOCESES) {
        await createDiocese({
          dioceseId: diocese.dioceseId,
          name: diocese.name,
          isMetropolitan: diocese.isMetropolitan,
        })
      }
      await loadDioceses()
    } catch (error) {
      console.error("Erreur seed diocèses:", error)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diocèses</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des diocèses du Sénégal
          </p>
        </div>
        {dioceses.length === 0 && (
          <Button onClick={seedDioceses}>
            <Plus className="h-4 w-4 mr-2" />
            Initialiser les diocèses
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dioceses.map((diocese) => (
          <Card key={diocese.dioceseId}>
            <CardHeader>
              <CardTitle>{diocese.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ID: {diocese.dioceseId}
              </p>
              {diocese.isMetropolitan && (
                <p className="text-sm text-primary mt-2">Archidiocèse</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
