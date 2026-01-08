"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import AdminDioceseSidebar from "@/components/admin/sidebar-diocese"
import AdminDioceseHeader from "@/components/admin/header-diocese"
import { useSearchParams } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function AdminDioceseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'

  return (
    <ProtectedRoute requiredRole="diocese">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <AdminDioceseSidebar />
        <div className="lg:pl-72 transition-all duration-300">
          <AdminDioceseHeader openSidebar={() => setSidebarOpen(true)} />
          <main className="py-8 px-4 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
