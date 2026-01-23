"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { LogOut, ChevronRight } from "lucide-react"
import { useSidebar } from "./SidebarContext"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Header() {
  const { user, claims } = useAuth()
  const router = useRouter()
  const { collapsed } = useSidebar()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'Admin'
  }

  // Fonction pour obtenir le label du rôle (UI uniquement)
  const getRoleLabel = () => {
    if (!claims?.role) return "Admin"
    const roleMap: Record<string, string> = {
      super_admin: "Super Admin",
      archdiocese_admin: "Archidiocèse",
      diocese_admin: "Diocèse",
      parish_admin: "Paroisse",
      church_admin: "Église"
    }
    return roleMap[claims.role] || claims.role.replace("_", " ")
  }

  // Breadcrumb simple (UI uniquement)
  const getBreadcrumb = () => {
    if (pathname === "/admin/dashboard") return "Tableau de bord"
    const parts = pathname.split("/").filter(Boolean)
    if (parts.length > 1) {
      return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1)
    }
    return "Administration"
  }

  return (
    <header className={`flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-30 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="flex items-center gap-4">
        {/* Breadcrumb simple */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/admin/dashboard" className="hover:text-amber-600 transition-colors">
            Dashboard
          </Link>
          {pathname !== "/admin/dashboard" && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{getBreadcrumb()}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Badge du rôle utilisateur */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-600 flex items-center justify-center text-white font-semibold">
            {getUserDisplayName().charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{getUserDisplayName()}</span>
            <span className="text-xs text-amber-600 font-medium">{getRoleLabel()}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-red-600 flex items-center gap-1 hover:underline transition text-sm"
        >
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </header>
  )
}
