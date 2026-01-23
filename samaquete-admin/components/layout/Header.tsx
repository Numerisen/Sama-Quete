"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useSidebar } from "./SidebarContext"

export function Header() {
  const { user, claims } = useAuth()
  const router = useRouter()
  const { collapsed } = useSidebar()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
    return 'Admin'
  }

  return (
    <header className={`flex items-center justify-between p-4 bg-white shadow sticky top-0 z-30 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-amber-600 flex items-center justify-center text-white font-semibold">
          {getUserDisplayName().charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-amber-600 text-lg">
          Bonjour, {getUserDisplayName()}
        </span>
      </div>
      <button 
        onClick={handleLogout}
        className="text-red-600 flex items-center gap-1 hover:underline transition"
      >
        <LogOut className="w-5 h-5" /> Déconnexion
      </button>
    </header>
  )
}
