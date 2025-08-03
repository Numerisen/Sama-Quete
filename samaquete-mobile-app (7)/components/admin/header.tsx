"use client"

import { LogOut } from "lucide-react"

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <img src="/placeholder-user.jpg" className="w-9 h-9 rounded-full border-2 border-blue-900" alt="Admin" />
        <span className="font-medium text-blue-900 text-lg">Bonjour, Admin</span>
      </div>
      <button className="text-red-600 flex items-center gap-1 hover:underline transition">
        <LogOut className="w-5 h-5" /> Déconnexion
      </button>
    </header>
  )
}
