"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { getDonationTypes } from "@/lib/firestore/services"
import { DonationType } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DonationTypesPage() {
  const { claims } = useAuth()
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDonationTypes()
  }, [claims])

  async function loadDonationTypes() {
    try {
      const data = await getDonationTypes(claims?.parishId)
      setDonationTypes(data)
    } catch (error) {
      console.error("Erreur chargement types de dons:", error)
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
          <h1 className="text-3xl font-bold">Types de dons</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des types de dons pour la paroisse
          </p>
        </div>
        {claims?.role === "parish_admin" && (
          <Link href="/admin/donation-types/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau type
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {donationTypes.map((type) => (
          <Card key={type.donationTypeId}>
            <CardHeader>
              <CardTitle>{type.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {type.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {type.description}
                </p>
              )}
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Montants par défaut:</p>
                <div className="flex flex-wrap gap-2">
                  {type.defaultAmounts.map((amount, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-secondary rounded text-xs"
                    >
                      {amount.toLocaleString()} FCFA
                    </span>
                  ))}
                </div>
              </div>
              <p className={`text-sm mt-2 ${type.isActive ? "text-green-600" : "text-red-600"}`}>
                {type.isActive ? "Active" : "Inactive"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
