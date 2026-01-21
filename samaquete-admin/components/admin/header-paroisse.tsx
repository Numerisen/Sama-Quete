"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Bell, User, LogOut, Settings, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminParoisseHeader({ openSidebar }: { openSidebar: () => void }) {
  const searchParams = useSearchParams()
  const paroisse = searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'
  const router = useRouter()
  const { logout, userRole } = useAuth()
  const { toast } = useToast()
  const [notifications] = useState(3) // Simulé

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      })
      router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      toast({
        title: "Erreur",
        description: "Impossible de se déconnecter",
        variant: "destructive"
      })
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Bouton menu mobile */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={openSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Titre de la page actuelle */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-gray-900">
                Administration Paroisse
              </h1>
              <p className="text-sm text-gray-600 truncate max-w-md">
                {userRole?.parishName || paroisse}
              </p>
            </div>
          </div>

          {/* Actions de droite */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Nouveau don reçu</p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Activité programmée</p>
                    <p className="text-xs text-gray-500">Demain à 18h</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Nouveau fidèle inscrit</p>
                    <p className="text-xs text-gray-500">Il y a 1 jour</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {userRole?.name || 'Admin Paroisse'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {userRole?.email || 'Mon compte'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
