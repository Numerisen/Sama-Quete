"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Newspaper, DollarSign, Settings, Calendar, Activity, Clock, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Sidebar ADMIN ÉGLISE
 * 
 * Objectif: Navigation intuitive pour l'admin église (producteur de contenu local)
 * 
 * Pages incluses:
 * - Dashboard: Vue d'ensemble et statistiques locales
 * - Actualités: Création/modification (draft/pending), workflow validation
 * - Activités: Gestion des activités locales
 * - prières: Proposition d'horaires/contenus
 * - Dons: Lecture seule, visualisation des dons
 * - Paramètres: Paramètres internes de l'église
 * 
 * ⚠️ Restrictions:
 * - Pas de gestion des paroisses ni d'autres églises
 * - Pas de publication directe côté mobile
 * - Accès limité au contenu local uniquement
 */
export default function AdminEgliseSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const churchId = userRole?.churchId || searchParams.get('churchId') || ''
  const parishId = userRole?.parishId || searchParams.get('parishId') || ''
  const [collapsed, setCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Charger le nombre de contenus en attente de validation
  useEffect(() => {
    if (parishId && churchId) {
      loadPendingCount()
    }
  }, [parishId, churchId])

  const loadPendingCount = async () => {
    try {
      // Compter les actualités en attente
      const newsQ = query(
        collection(db, 'admin_news'),
        where('parishId', '==', parishId),
        where('churchId', '==', churchId),
        where('status', '==', 'pending')
      )
      const newsSnap = await getDocs(newsQ)
      
      // Compter les activités en attente (si collection existe)
      let activitiesCount = 0
      try {
        const activitiesQ = query(
          collection(db, 'parish_activities'),
          where('parishId', '==', parishId),
          where('churchId', '==', churchId),
          where('status', '==', 'pending')
        )
        const activitiesSnap = await getDocs(activitiesQ)
        activitiesCount = activitiesSnap.size
      } catch (e) {
        // Collection peut ne pas exister
      }

      setPendingCount(newsSnap.size + activitiesCount)
    } catch (error) {
      console.error('Erreur lors du chargement du compteur:', error)
    }
  }

  const links = [
    { 
      href: `/admineglise/dashboard${parishId ? `?parishId=${parishId}` : ''}${churchId ? `&churchId=${churchId}` : ''}`, 
      label: "Dashboard", 
      icon: <Home className="w-6 h-6" />,
      badge: null
    },
    { 
      href: `/admineglise/news${parishId ? `?parishId=${parishId}` : ''}${churchId ? `&churchId=${churchId}` : ''}`, 
      label: "Actualités", 
      icon: <Newspaper className="w-6 h-6" />,
      badge: pendingCount > 0 ? pendingCount : null
    },
    { 
      href: `/admineglise/activities${parishId ? `?parishId=${parishId}` : ''}${churchId ? `&churchId=${churchId}` : ''}`, 
      label: "Activités", 
      icon: <Activity className="w-6 h-6" />,
      badge: null
    },
    { 
      href: `/admineglise/prayers${parishId ? `?parishId=${parishId}` : ''}${churchId ? `&churchId=${churchId}` : ''}`, 
      label: "prières", 
      icon: <Clock className="w-6 h-6" />,
      badge: null
    },
    { 
      href: `/admineglise/donations${parishId ? `?parishId=${parishId}` : ''}${churchId ? `&churchId=${churchId}` : ''}`, 
      label: "Dons", 
      icon: <DollarSign className="w-6 h-6" />,
      badge: null,
      readOnly: true
    },
    { 
      href: `/admineglise/settings${parishId ? `?parishId=${parishId}` : ''}${churchId ? `&churchId=${churchId}` : ''}`, 
      label: "Paramètres", 
      icon: <Settings className="w-6 h-6" />,
      badge: null
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
      
      {/* Affichage de l'église actuelle */}
      {!collapsed && userRole?.churchId && (
        <div className="px-6 py-3 bg-white/10 border-b border-white/10">
          <div className="text-xs text-white/60 mb-1">Église actuelle</div>
          <div className="text-sm font-medium text-white truncate">{userRole.displayName || 'Église'}</div>
        </div>
      )}
      
      <nav className="flex-1 flex flex-col gap-1 mt-4 overflow-y-auto">
        {links.map(link => {
          // Détection spéciale pour le dashboard
          const isActive = link.label === "Dashboard" 
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
              {!collapsed && (
                <>
                  <span className="flex-1">{link.label}</span>
                  {link.readOnly && (
                    <Eye className="w-4 h-4 text-white/60" title="Lecture seule" />
                  )}
                  {link.badge && link.badge > 0 && (
                    <span className="bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </>
              )}
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
