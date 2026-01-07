"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Users, Newspaper, DollarSign, Bot, Settings, ShieldCheck, Church, Bell, Calendar, Activity, FileText, Tag, Clock, Heart, Gift, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

export default function AdminEgliseSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const eglise = searchParams.get('eglise') || 'Église Saint Jean Bosco'
  const [collapsed, setCollapsed] = useState(false)

  const links = [
    { 
      href: `/admineglise/dashboard?eglise=${encodeURIComponent(eglise)}`, 
      label: "Tableau de bord", 
      icon: <Home className="w-6 h-6" /> 
    },
    { 
      href: `/admineglise/prayers?eglise=${encodeURIComponent(eglise)}`, 
      label: "Heures de prières", 
      icon: <Clock className="w-6 h-6" /> 
    },
    { 
      href: `/admineglise/donation-types?eglise=${encodeURIComponent(eglise)}`, 
      label: "Types de dons", 
      icon: <Gift className="w-6 h-6" /> 
    },
    { 
      href: `/admineglise/donations?eglise=${encodeURIComponent(eglise)}`, 
      label: "Historique dons", 
      icon: <DollarSign className="w-6 h-6" /> 
    },
    
    { 
      href: `/admineglise/news?eglise=${encodeURIComponent(eglise)}`, 
      label: "Actualités", 
      icon: <Newspaper className="w-6 h-6" /> 
    },
    { 
      href: `/admineglise/settings?eglise=${encodeURIComponent(eglise)}`, 
      label: "Paramètres", 
      icon: <Settings className="w-6 h-6" /> 
    },
  ]

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-green-600 to-emerald-600 text-white shadow-lg z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center gap-2 p-6 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <>
            <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-wide">Sama Quete</span>
              <span className="text-xs text-white/70">Administration Église</span>
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
        className="absolute top-20 -right-3 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors z-50"
        aria-label={collapsed ? "Déplier" : "Plier"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      
      <nav className="flex-1 flex flex-col gap-1 mt-4 overflow-y-auto">
        {links.map(link => {
          // Détection spéciale pour le tableau de bord
          const isActive = link.label === "Tableau de bord" 
            ? pathname === "/admineglise/dashboard" || pathname === "/admineglise"
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
          © {new Date().getFullYear()} Sama Quete
        </div>
      )}
    </aside>
  )
}
