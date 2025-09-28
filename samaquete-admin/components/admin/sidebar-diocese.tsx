"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Users, Newspaper, DollarSign, Bot, Settings, ShieldCheck, Church, Bell, Calendar, Activity, FileText } from "lucide-react"

export default function AdminDioceseSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const diocese = searchParams.get('diocese') || 'Archidiocèse de Dakar'

  const links = [
    { 
      href: `/admindiocese/dashboard?diocese=${encodeURIComponent(diocese)}`, 
      label: "Tableau de bord", 
      icon: <Home className="w-6 h-6" /> 
    },
    { 
      href: `/admindiocese/paroisses?diocese=${encodeURIComponent(diocese)}`, 
      label: "Paroisses", 
      icon: <Church className="w-6 h-6" /> 
    },
    { 
      href: `/admindiocese/users?diocese=${encodeURIComponent(diocese)}`, 
      label: "Utilisateurs", 
      icon: <Users className="w-6 h-6" /> 
    },
    { 
      href: `/admindiocese/news?diocese=${encodeURIComponent(diocese)}`, 
      label: "Actualités", 
      icon: <Newspaper className="w-6 h-6" /> 
    },
    { 
      href: `/admindiocese/donations?diocese=${encodeURIComponent(diocese)}`, 
      label: "Dons", 
      icon: <DollarSign className="w-6 h-6" /> 
    },
    { 
      href: `/admindiocese/liturgy?diocese=${encodeURIComponent(diocese)}`, 
      label: "Liturgie", 
      icon: <Calendar className="w-6 h-6" /> 
    },
    { 
      href: `/admindiocese/notifications?diocese=${encodeURIComponent(diocese)}`, 
      label: "Notifications", 
      icon: <Bell className="w-6 h-6" /> 
    },
    /*{ 
      href: `/admindiocese/history?diocese=${encodeURIComponent(diocese)}`, 
      label: "Historique", 
      icon: <Activity className="w-6 h-6" /> 
    },*/
    /*{ 
      href: `/admindiocese/contents?diocese=${encodeURIComponent(diocese)}`, 
      label: "Contenus", 
      icon: <FileText className="w-6 h-6" /> 
    },*/
    /*{ 
      href: `/admindiocese/assistant?diocese=${encodeURIComponent(diocese)}`, 
      label: "Assistant IA", 
      icon: <Bot className="w-6 h-6" /> 
    },*/
    /*{ 
      href: `/admindiocese/settings?diocese=${encodeURIComponent(diocese)}`, 
      label: "Paramètres", 
      icon: <Settings className="w-6 h-6" /> 
    },*/
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-amber-600 to-orange-600 text-white shadow-lg z-40 flex flex-col">
      <div className="flex items-center gap-2 p-6 border-b border-white/10">
        <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-wide">Sama Quete</span>
          <span className="text-xs text-white/70">Administration Diocèse</span>
        </div>
      </div>
      
      {/* Affichage du diocèse actuel */}
      <div className="px-6 py-3 bg-white/10 border-b border-white/10">
        <div className="text-xs text-white/60 mb-1">Diocèse actuel</div>
        <div className="text-sm font-medium text-white truncate">{diocese}</div>
      </div>
      
      <nav className="flex-1 flex flex-col gap-1 mt-4 overflow-y-auto">
        {links.map(link => {
          // Détection spéciale pour le tableau de bord
          const isActive = link.label === "Tableau de bord" 
            ? pathname === "/admindiocese/dashboard" || pathname === "/admindiocese"
            : pathname === link.href.split('?')[0]
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8 ${isActive ? "bg-white/20 font-semibold shadow-lg" : ""}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="mt-auto p-4 text-xs text-center text-white/60">
        © {new Date().getFullYear()} Sama Quete
      </div>
    </aside>
  )
}
