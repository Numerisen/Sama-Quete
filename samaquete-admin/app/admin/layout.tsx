"use client"

import { AuthProvider } from "@/components/auth/AuthProvider"
import { AdminLayout } from "@/components/layout/AdminLayout"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AuthProvider>
  )
}
