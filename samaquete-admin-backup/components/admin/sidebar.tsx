"use client"

import { Bot, DollarSign, Home, Newspaper, Users, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const links = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: <Home className="w-6 h-6" /> },
  { href: "/admin/users", label: "Utilisateurs", icon: <Users className="w-6 h-6" /> },
  { href: "/admin/news", label: "Actualités", icon: <Newspaper className="w-6 h-6" /> },
  { href: "/admin/donations", label: "Dons", icon: <DollarSign className="w-6 h-6" /> },
  { href: "/admin/dioceses", label: "Dioceses", icon: <Users className="w-6 h-6" /> },
  { href: "/admin/paroisses", label: "Paroisses", icon: <Bot className="w-6 h-6" /> },
  //{ href: "/admin/settings", label: "Paramètres", icon: <Settings className="w-6 h-6" /> },
  //{ href: "/admin/security", label: "Sécurité & Audit", icon: <ShieldCheck className="w-6 h-6" /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-amber-600 to-orange-600 text-white shadow-lg z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center gap-2 p-6 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <>
            <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
            <span className="font-bold text-xl tracking-wide">Jàngu Bi Super Admin</span>
          </>
        )}
        {collapsed && (
          <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
        )}
      </div>
      
      {/* Bouton pour plier/déplier */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors z-50"
        aria-label={collapsed ? "Déplier" : "Plier"}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
      
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8 ${pathname === link.href ? "bg-white/20 font-semibold shadow-lg" : ""} ${collapsed ? 'justify-center px-3' : ''}`}
            title={collapsed ? link.label : undefined}
          >
            {link.icon}
            {!collapsed && <span>{link.label}</span>}
          </Link>
        ))}
      </nav>
      {!collapsed && (
        <div className="mt-auto p-4 text-xs text-center text-white/60">© {new Date().getFullYear()} Jàngu Bi</div>
      )}
    </aside>
  )
}