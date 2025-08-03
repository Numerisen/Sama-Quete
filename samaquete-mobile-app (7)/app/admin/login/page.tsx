"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "../auth/actions"
import { Loader2, LogIn, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("password", password)

    const result = await signIn(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      // Redirection handled by server action on success
    }
    setIsPending(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4"
    >
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="text-center flex flex-col items-center gap-2">
          <img src="/placeholder-logo.png" alt="Logo SamaQuête" className="w-16 h-16 mx-auto mb-2" />
          <CardTitle className="text-3xl font-bold text-gray-800">Connexion Admin</CardTitle>
          <p className="text-gray-500">Accédez au tableau de bord SamaQuête</p>
          <p className="text-sm text-gray-400 mt-2">(Utilisez: admin@samaquete.com / password)</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@samaquete.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <Link href="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 transition">
                <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
              </Link>
              <Link href="#" className="text-blue-600 hover:underline">Mot de passe oublié ?</Link>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
