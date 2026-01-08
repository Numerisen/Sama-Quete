"use client"
export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import AdminEgliseSidebar from "@/components/admin/sidebar-eglise"
import AdminEgliseHeader from "@/components/admin/header-eglise"
import { useSearchParams } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function AdminEgliseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const eglise = searchParams.get('eglise') || 'Église Saint Jean Bosco'

  return (
    <ProtectedRoute requiredRole="paroisse">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <AdminEgliseSidebar />
        <div className="lg:pl-72">
          <AdminEgliseHeader openSidebar={() => setSidebarOpen(true)} />
          <main className="py-8 px-4 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
