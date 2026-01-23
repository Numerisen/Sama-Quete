"use client"
import { useState, useEffect } from "react"
import AdminParoisseSidebar from "@/components/admin/sidebar-paroisse"
import AdminParoisseHeader from "@/components/admin/header-paroisse"
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
