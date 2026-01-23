import type React from "react"

// Layout spécial pour la page d'initialisation
// Pas de ProtectedRoute car cette page crée les rôles !
export default function InitUsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {children}
    </div>
  )
}