"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { getParish, getChurch, getDioceses } from "@/lib/firestore/services"
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
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
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
    roles: ["super_admin", "archdiocese_admin"],
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
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold">Sama-Quête Admin</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {displayName}
        </p>
      </div>
      <nav className="px-4 pb-4">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg mb-1 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
