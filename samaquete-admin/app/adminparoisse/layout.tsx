"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import AdminParoisseAdminSidebar from "@/components/admin/sidebar-paroisse-admin"
import AdminParoisseAdminHeader from "@/components/admin/header-paroisse-admin"
import { useSearchParams } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function AdminParoisseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  return (
    <ProtectedRoute requiredRole="paroisse">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <AdminParoisseAdminSidebar />
        <div className="lg:pl-72 transition-all duration-300" style={{ paddingLeft: 'var(--sidebar-width, 18rem)' }}>
          <AdminParoisseAdminHeader openSidebar={() => setSidebarOpen(true)} />
          <main className="py-8 px-4 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

