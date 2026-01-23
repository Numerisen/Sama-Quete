"use client"

import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { SidebarProvider } from "./SidebarContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { UserRole } from "@/types"
import { useSidebar } from "./SidebarContext"

interface AdminLayoutProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export function AdminLayout({
  children,
  requiredRole,
}: AdminLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
