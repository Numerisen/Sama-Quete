"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Users, Newspaper, DollarSign, Bot, Settings, ShieldCheck, Church, Bell, Calendar, Activity, FileText, Tag, Clock, Heart } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function AdminParoisseSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const paroisse = userRole?.parishName || searchParams.get('paroisse') || 'Paroisse Saint Jean Bosco'

  const links = [
    { 
      href: `/adminparoisse/dashboard?paroisse=${encodeURIComponent(paroisse)}`, 
      label: "Tableau de bord", 
      icon: <Home className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/prayers?paroisse=${encodeURIComponent(paroisse)}`, 
      label: "Heures de prières", 
      icon: <Clock className="w-6 h-6" /> 
    },

    { 
      href: `/adminparoisse/donations?paroisse=${encodeURIComponent(paroisse)}`, 
      label: "Dons de la paroisse", 
      icon: <DollarSign className="w-6 h-6" /> 
    },
    
    { 
      href: `/adminparoisse/news?paroisse=${encodeURIComponent(paroisse)}`, 
      label: "Actualités", 
      icon: <Newspaper className="w-6 h-6" /> 
    },
    { 
      href: `/adminparoisse/settings?paroisse=${encodeURIComponent(paroisse)}`, 
      label: "Paramètres", 
      icon: <Settings className="w-6 h-6" /> 
    },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-600 to-emerald-600 text-white shadow-lg z-40 flex flex-col">
      <div className="flex items-center gap-2 p-6 border-b border-white/10">
        <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-wide">Sama Quete</span>
          <span className="text-xs text-white/70">Administration Paroisse</span>
        </div>
      </div>
      
     
      
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
