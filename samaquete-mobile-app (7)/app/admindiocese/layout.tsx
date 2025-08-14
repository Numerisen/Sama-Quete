"use client"
import { useState, useEffect } from "react"
import AdminDioceseSidebar from "@/components/admin/sidebar-diocese"
import AdminDioceseHeader from "@/components/admin/header-diocese"
import { useSearchParams } from "next/navigation"

export default function AdminDioceseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <AdminDioceseSidebar />
      <div className="lg:pl-72">
        <AdminDioceseHeader openSidebar={() => setSidebarOpen(true)} />
        <main className="py-8 px-4 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
