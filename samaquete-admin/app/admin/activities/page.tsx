"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getActivities } from "@/lib/firestore/services"
import { Activity, ContentStatus } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ViewToggle, ViewMode } from "@/components/ui/view-toggle"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ActivitiesPage() {
  const { claims } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    loadActivities()
  }, [claims])

  async function loadActivities() {
    try {
      let data = await getActivities()
      // Filtrer selon le rôle
      if (claims?.role === "parish_admin" && claims.parishId) {
        data = data.filter(a => a.parishId === claims.parishId)
      } else if (claims?.role === "diocese_admin" && claims.dioceseId) {
        data = data.filter(a => a.dioceseId === claims.dioceseId)
      }
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

  // Pagination
  const totalPages = Math.ceil(activities.length / itemsPerPage)
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return activities.slice(start, end)
  }, [activities, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activités</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des activités • {activities.length} activité{activities.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          {claims?.role === "church_admin" && (
            <Link href="/admin/activities/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle activité
              </Button>
            </Link>
          )}
        </div>
      </div>

      {viewMode === "cards" && (
        <div className="space-y-4">
          {paginatedActivities.map((activity) => (
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
      )}

      {viewMode === "list" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedActivities.map((activity) => (
                <TableRow key={activity.activityId}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell className="max-w-md truncate">{activity.description}</TableCell>
                  <TableCell>{format(new Date(activity.date), "PP")}</TableCell>
                  <TableCell>{activity.location || "-"}</TableCell>
                  <TableCell>{getStatusBadge(activity.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activities.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={activities.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage)
            setCurrentPage(1)
          }}
        />
      )}
    </div>
  )
}
