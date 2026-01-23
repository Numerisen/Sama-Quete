"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Users, Newspaper, DollarSign, Church, Bell, Tag, ChevronLeft, ChevronRight, Info, Settings, FileText } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function AdminParoisseAdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  const [collapsed, setCollapsed] = useState(false)

  // Liens selon le cahier des charges - Admin Paroisse
  const links = [
    { 
      href: `/adminparoisse/dashboard${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Dashboard", 
      icon: <Home className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/informations${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Informations paroisse", 
      icon: <Info className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/eglises${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Églises", 
      icon: <Church className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/contenus${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Actualités & contenus", 
      icon: <FileText className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/donation-types${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Types de dons", 
      icon: <Tag className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/donations${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Dons", 
      icon: <DollarSign className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/notifications${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Notifications", 
      icon: <Bell className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/users${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Utilisateurs", 
      icon: <Users className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/settings${parishId ? `?parishId=${parishId}` : ''}`, 
      label: "Paramètres paroisse", 
      icon: <Settings className="w-6 h-6" /> 
    },
  ]

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-600 to-indigo-600 text-white shadow-lg z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center gap-2 p-6 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <>
            <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wide">Jàngu Bi</span>
              <span className="text-xs text-white/70">Admin Paroisse</span>
            </div>
          </>
        )}
        {collapsed && (
          <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
        )}
      </div>
      
      {/* Bouton pour plier/déplier */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors z-50"
        aria-label={collapsed ? "Déplier" : "Plier"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      
      {/* Affichage de la paroisse actuelle */}
      {!collapsed && userRole?.parishId && (
        <div className="px-6 py-3 bg-white/10 border-b border-white/10">
          <div className="text-xs text-white/60 mb-1">Paroisse actuelle</div>
          <div className="text-sm font-medium text-white truncate">{userRole.displayName || 'Paroisse'}</div>
        </div>
      )}
      
      <nav className="flex-1 flex flex-col gap-1 mt-4 overflow-y-auto">
        {links.map(link => {
          // Détection spéciale pour le tableau de bord
          const isActive = link.label === "Tableau de bord" 
            ? pathname === "/adminparoisse/dashboard" || pathname === "/adminparoisse"
            : pathname === link.href.split('?')[0]
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8 ${isActive ? "bg-white/20 font-semibold shadow-lg" : ""} ${collapsed ? 'justify-center px-3' : ''}`}
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>
      
      {!collapsed && (
        <div className="mt-auto p-4 text-xs text-center text-white/60">
          © {new Date().getFullYear()} Jàngu Bi
        </div>
      )}
    </aside>
  )
}

