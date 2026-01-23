"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { getParish, getChurch, getDioceses } from "@/lib/firestore/services"
import { useSidebar } from "./SidebarContext"
import {
  LayoutDashboard,
  Building2,
  Church,
  Newspaper,
  Heart,
  Bell,
  Users,
  Settings,
  Activity,
  BookOpen,
  Clock,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface SidebarItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },
  {
    label: "Diocèses",
    href: "/admin/dioceses",
    icon: Building2,
    roles: ["super_admin","archdiocese_admin"],
  },
  {
    label: "Paroisses",
    href: "/admin/parishes",
    icon: Church,
    roles: ["super_admin", "diocese_admin","archdiocese_admin"],
  },
  {
    label: "Églises",
    href: "/admin/churches",
    icon: Church,
    roles: ["super_admin", "diocese_admin", "parish_admin","archdiocese_admin"],
  },
  {
    label: "Actualités",
    href: "/admin/news",
    icon: Newspaper,
    roles: ["archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },

  {
    label: "Heures de messes",
    href: "/admin/prayer-times",
    icon: Clock,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },
  {
    label: "Types de dons",
    href: "/admin/donation-types",
    icon: Heart,
    roles: ["parish_admin", "church_admin"],
  },
  {
    label: "Dons",
    href: "/admin/donations",
    icon: Heart,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    roles: ["super_admin", "diocese_admin","archidiocese_admin"],
  },
  {
    label: "Fidèles",
    href: "/admin/fideles",
    icon: UserCircle,
    roles: ["super_admin"],
  },
  {
    label: "Statistiques",
    href: "/admin/statistics",
    icon: Activity,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin"],
  },
  {
    label: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { claims } = useAuth()
  const [entityName, setEntityName] = useState<string>("")
  const { collapsed, setCollapsed } = useSidebar()

  useEffect(() => {
    async function loadEntityName() {
      if (!claims) return

      try {
        if (claims.role === "parish_admin" && claims.parishId) {
          const parish = await getParish(claims.parishId)
          if (parish) {
            setEntityName(parish.name)
          }
        } else if (claims.role === "church_admin" && claims.churchId) {
          const church = await getChurch(claims.churchId)
          if (church) {
            setEntityName(church.name)
          }
        } else if (claims.role === "diocese_admin" && claims.dioceseId) {
          const dioceses = await getDioceses()
          const diocese = dioceses.find(d => d.dioceseId === claims.dioceseId)
          if (diocese) {
            setEntityName(diocese.name)
          }
        } else if (claims.role === "archdiocese_admin") {
          setEntityName("Archidiocèse de Dakar")
        } else if (claims.role === "super_admin") {
          setEntityName("Super Administrateur")
        }
      } catch (error) {
        console.error("Erreur chargement nom entité:", error)
      }
    }

    loadEntityName()
  }, [claims])

  const filteredItems = sidebarItems.filter((item) =>
    claims?.role ? item.roles.includes(claims.role) : false
  )

  const displayName = entityName || claims?.role?.replace("_", " ").toUpperCase() || ""

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-amber-600 to-orange-600 text-white shadow-lg z-40 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center gap-2 p-6 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && (
          <>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Church className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-wide block">Jàngu Bi</span>
              <span className="text-xs text-white/80 block">{displayName}</span>
            </div>
          </>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Church className="w-6 h-6" />
          </div>
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
      
      <nav className="flex-1 flex flex-col gap-1 mt-4 overflow-y-auto">
        {/* Dashboard - toujours en premier */}
        {filteredItems
          .filter(item => item.label === "Dashboard")
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8",
                  isActive ? "bg-white/20 font-semibold shadow-lg" : "",
                  collapsed ? 'justify-center px-3 rounded-full' : ''
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        
        {/* GESTION */}
        {!collapsed && filteredItems.some(item => ["Diocèses", "Paroisses", "Églises", "Utilisateurs", "Fidèles"].includes(item.label)) && (
          <div className="px-6 py-2 mt-2">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">GESTION</p>
          </div>
        )}
        {filteredItems
          .filter(item => ["Diocèses", "Paroisses", "Églises", "Utilisateurs", "Fidèles"].includes(item.label))
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8",
                  isActive ? "bg-white/20 font-semibold shadow-lg" : "",
                  collapsed ? 'justify-center px-3 rounded-full' : ''
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        
        {/* COMMUNICATION */}
        {!collapsed && filteredItems.some(item => ["Actualités", "Heures de messes"].includes(item.label)) && (
          <div className="px-6 py-2 mt-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">COMMUNICATION</p>
          </div>
        )}
        {filteredItems
          .filter(item => ["Actualités", "Heures de messes"].includes(item.label))
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8",
                  isActive ? "bg-white/20 font-semibold shadow-lg" : "",
                  collapsed ? 'justify-center px-3 rounded-full' : ''
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        
        {/* FINANCES */}
        {!collapsed && filteredItems.some(item => ["Types de dons", "Dons"].includes(item.label)) && (
          <div className="px-6 py-2 mt-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">FINANCES</p>
          </div>
        )}
        {filteredItems
          .filter(item => ["Types de dons", "Dons"].includes(item.label))
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8",
                  isActive ? "bg-white/20 font-semibold shadow-lg" : "",
                  collapsed ? 'justify-center px-3 rounded-full' : ''
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        
        {/* STATISTIQUES */}
        {!collapsed && filteredItems.some(item => item.label === "Statistiques") && (
          <div className="px-6 py-2 mt-4">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">STATISTIQUES</p>
          </div>
        )}
        {filteredItems
          .filter(item => item.label === "Statistiques")
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8",
                  isActive ? "bg-white/20 font-semibold shadow-lg" : "",
                  collapsed ? 'justify-center px-3 rounded-full' : ''
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        
        {/* Paramètres - toujours en dernier */}
        {filteredItems
          .filter(item => item.label === "Paramètres")
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8",
                  isActive ? "bg-white/20 font-semibold shadow-lg" : "",
                  collapsed ? 'justify-center px-3 rounded-full' : ''
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-6 h-6" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
      </nav>
      {!collapsed && (
        <div className="mt-auto p-4 text-xs text-center text-white/60">© {new Date().getFullYear()} Jàngu Bi</div>
      )}
    </aside>
  )
}
