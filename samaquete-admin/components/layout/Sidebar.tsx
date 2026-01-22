"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { cn } from "@/lib/utils"
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
    roles: ["super_admin"],
  },
  {
    label: "Paroisses",
    href: "/admin/parishes",
    icon: Church,
    roles: ["super_admin", "diocese_admin"],
  },
  {
    label: "Églises",
    href: "/admin/churches",
    icon: Church,
    roles: ["super_admin", "diocese_admin", "parish_admin"],
  },
  {
    label: "Informations paroisse",
    href: "/admin/parish/info",
    icon: Church,
    roles: ["parish_admin"],
  },
  {
    label: "Actualités",
    href: "/admin/news",
    icon: Newspaper,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },
  {
    label: "Activités",
    href: "/admin/activities",
    icon: Activity,
    roles: ["church_admin"],
  },
  {
    label: "Prières",
    href: "/admin/prayers",
    icon: BookOpen,
    roles: ["church_admin"],
  },
  {
    label: "Types de dons",
    href: "/admin/donation-types",
    icon: Heart,
    roles: ["parish_admin"],
  },
  {
    label: "Dons",
    href: "/admin/donations",
    icon: Heart,
    roles: ["super_admin", "archdiocese_admin", "diocese_admin", "parish_admin", "church_admin"],
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    roles: ["parish_admin"],
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
    roles: ["super_admin", "diocese_admin", "parish_admin"],
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

  const filteredItems = sidebarItems.filter((item) =>
    claims?.role ? item.roles.includes(claims.role) : false
  )

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold">Sama-Quête Admin</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {claims?.role?.replace("_", " ").toUpperCase()}
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
