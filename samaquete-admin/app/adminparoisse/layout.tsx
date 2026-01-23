"use client"
import { useState, useEffect, Suspense } from "react"
import AdminParoisseSidebar from "@/components/admin/sidebar-paroisse"
import AdminParoisseHeader from "@/components/admin/header-paroisse"
import { useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

function AdminParoisseLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  return (
    <ProtectedRoute requiredRole="parish_admin">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <AdminParoisseSidebar />
        <div className="lg:pl-72">
          <AdminParoisseHeader openSidebar={() => setSidebarOpen(true)} />
          <main className="py-8 px-4 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function AdminParoisseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Chargement...</span>
        </div>
      </div>
    }>
      <AdminParoisseLayoutContent>
        {children}
      </AdminParoisseLayoutContent>
    </Suspense>
  )
}
