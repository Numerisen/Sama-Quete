"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, Users, Newspaper, DollarSign, Bot, Settings, ShieldCheck } from "lucide-react"

const links = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: <Home className="w-6 h-6" /> },
  { href: "/admin/users", label: "Utilisateurs", icon: <Users className="w-6 h-6" /> },
  { href: "/admin/news", label: "Actualités", icon: <Newspaper className="w-6 h-6" /> },
  { href: "/admin/donations", label: "Dons & Statistiques", icon: <DollarSign className="w-6 h-6" /> },
  { href: "/admin/dioceses", label: "Dioceses", icon: <Users className="w-6 h-6" /> },
  { href: "/admin/paroisses", label: "Paroisses", icon: <Bot className="w-6 h-6" /> },
  //{ href: "/admin/settings", label: "Paramètres", icon: <Settings className="w-6 h-6" /> },
  //{ href: "/admin/security", label: "Sécurité & Audit", icon: <ShieldCheck className="w-6 h-6" /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 to-indigo-700 text-white shadow-lg z-40 flex flex-col">
      <div className="flex items-center gap-2 p-6 border-b border-white/10">
        <img src="/placeholder-logo.png" className="w-10 h-10" alt="Logo" />
        <span className="font-bold text-xl tracking-wide">Sama Quete Super Admin</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-6 py-3 rounded-l-full transition-all duration-200 hover:bg-white/10 hover:pl-8 ${pathname === link.href ? "bg-white/20 font-semibold shadow-lg" : ""}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 text-xs text-center text-white/60">© {new Date().getFullYear()} Sama Quete</div>
    </aside>
  )
}