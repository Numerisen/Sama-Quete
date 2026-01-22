"use client"

import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { UserRole } from "@/types"

interface AdminLayoutProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

export function AdminLayout({
  children,
  requiredRole,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="pt-16 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
