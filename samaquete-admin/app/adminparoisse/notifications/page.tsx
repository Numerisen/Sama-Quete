"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"

export default function AdminParoisseNotificationsPage() {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="mb-8 shadow-xl bg-white/80 border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-black mb-1">
            Notifications - {paroisse}
          </CardTitle>
          <p className="text-black/80 text-sm">
            Gérez les notifications de votre diocèse.
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center text-black/60 py-8">
            Page des notifications en cours de développement...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
