import AdminHeader from "@/components/admin/header"
import AdminSidebar from "@/components/admin/sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import type React from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="flex min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <AdminSidebar />
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
