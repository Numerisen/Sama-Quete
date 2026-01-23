"use client"

import { Menu, Bell, User, Settings, LogOut } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface HeaderProps {
  openSidebar?: () => void
}

export default function AdminParoisseAdminHeader({ openSidebar }: HeaderProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Bouton menu pour mobile */}
        <button
          onClick={openSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Titre et paroisse */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">Administration Paroisse</h1>
            <p className="text-sm text-gray-600">{paroisse}</p>
          </div>
        </div>

        {/* Actions utilisateur */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Menu utilisateur */}
          <div className="relative group">
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.email?.split('@')[0] || 'Admin Paroisse'}
              </span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

