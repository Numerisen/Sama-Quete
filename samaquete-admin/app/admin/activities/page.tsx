"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getActivities } from "@/lib/firestore/services"
import { Activity, ContentStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function ActivitiesPage() {
  const { claims } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [claims])

  async function loadActivities() {
    try {
      const data = await getActivities(claims?.parishId, claims?.dioceseId)
      setActivities(data)
    } catch (error) {
      console.error("Erreur chargement activités:", error)
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
          <h1 className="text-3xl font-bold">Activités</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des activités
          </p>
        </div>
        {claims?.role === "church_admin" && (
          <Link href="/admin/activities/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle activité
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.activityId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{activity.title}</CardTitle>
                {getStatusBadge(activity.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {activity.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Date: {format(new Date(activity.date), "PP")}
                </span>
                {activity.location && (
                  <span>Lieu: {activity.location}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
