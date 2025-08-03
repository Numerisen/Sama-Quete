"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { updateDiocese, getDioceseById } from "../../action" // Import getDioceseById
import type { Diocese } from "@/lib/mock-db" // Import type

interface EditDiocesePageProps {
  params: {
    id: string
  }
}

export default function EditDiocesePage({ params }: EditDiocesePageProps) {
  const router = useRouter()
  const [diocese, setDiocese] = useState<Diocese | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDiocese() {
      const data = await getDioceseById(params.id) // Fetch from mock data
      if (!data) {
        setError("Diocèse introuvable ou erreur de chargement.")
      } else {
        setDiocese(data)
      }
      setLoading(false)
    }
    fetchDiocese()
  }, [params.id])

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setError(null)
    formData.append("id", params.id) // Add the ID to the form data
    const result = await updateDiocese(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push("/admin/dioceses")
    }
    setIsPending(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  if (!diocese) {
    return <div className="text-gray-500 text-center">Diocèse non trouvé.</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold text-gray-800">Modifier le Diocèse</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Diocèse</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Diocèse</Label>
              <Input
                id="name"
                name="name"
                placeholder="Archidiocèse de Dakar"
                required
                defaultValue={diocese.name}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                name="location"
                placeholder="Dakar, Sénégal"
                defaultValue={diocese.location}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brève description du diocèse..."
                defaultValue={diocese.description}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
              <Input
                id="imageUrl"
                name="image_url"
                placeholder="https://example.com/diocese.jpg"
                defaultValue={diocese.image_url}
                className="h-11"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Mettre à jour le Diocèse
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
