"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getNotifications } from "@/lib/firestore/services"
import { Notification, ContentStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function NotificationsPage() {
  const { claims } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
  }, [claims])

  async function loadNotifications() {
    try {
      const data = await getNotifications(claims?.parishId, claims?.dioceseId)
      setNotifications(data)
    } catch (error) {
      console.error("Erreur chargement notifications:", error)
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
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des notifications
          </p>
        </div>
        {claims?.role === "parish_admin" && (
          <Link href="/admin/notifications/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle notification
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.notificationId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{notification.title}</CardTitle>
                {getStatusBadge(notification.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{notification.type}</Badge>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
