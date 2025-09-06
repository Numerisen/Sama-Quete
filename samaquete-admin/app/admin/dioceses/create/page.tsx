"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { createDiocese } from "../action"

export default function CreateDiocesePage() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true)
    setError(null)
    const result = await createDiocese(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push("/admin/dioceses")
    }
    setIsPending(false)
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
        <h2 className="text-3xl font-bold text-gray-800">Ajouter un nouveau Diocèse</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du Diocèse</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du Diocèse</Label>
              <Input id="name" name="name" placeholder="Archidiocèse de Dakar" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input id="location" name="location" placeholder="Dakar, Sénégal" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Brève description du diocèse..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image (optionnel)</Label>
              <Input id="imageUrl" name="image_url" placeholder="https://example.com/diocese.jpg" className="h-11" />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Créer le Diocèse
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
