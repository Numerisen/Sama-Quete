"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"

export default function AdminDioceseAssistantPage() {
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Diocèse de Thiès'

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-black mb-1">
            Assistant IA - {diocese}
          </CardTitle>
          <p className="text-black/80 text-sm">
            Assistant intelligent pour votre diocèse.
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center text-black/60 py-8">
            Assistant IA en cours de développement...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
