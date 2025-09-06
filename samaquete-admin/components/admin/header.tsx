"use client"

import { LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function AdminHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <img src="/placeholder-user.jpg" className="w-9 h-9 rounded-full border-2 border-amber-600" alt="Admin" />
        <span className="font-medium text-amber-600 text-lg">
          Bonjour, {user?.email?.split('@')[0] || 'Admin'}
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
