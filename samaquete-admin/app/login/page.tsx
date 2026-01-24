"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { Church, Shield, Building2, MapPin, Home, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<'admin' | 'archdiocese' | 'diocese' | 'paroisse' | 'eglise'>('admin')
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!auth) {
      setError("Firebase Auth n'est pas initialisé")
      toast({
        title: "Erreur de connexion",
        description: "Firebase Auth n'est pas initialisé",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Vérifier que le type de compte correspond au filtre sélectionné
      const user = userCredential.user
      const tokenResult = await user.getIdTokenResult(true)
      const userRole = tokenResult.claims.role as string
      
      // Mapping entre loginType et les rôles attendus
      const roleMapping: Record<string, string[]> = {
        'admin': ['super_admin'],
        'archdiocese': ['archdiocese_admin'],
        'diocese': ['diocese_admin'],
        'paroisse': ['parish_admin'],
        'eglise': ['church_admin']
      }
      
      const allowedRoles = roleMapping[loginType] || []
      
      if (!allowedRoles.includes(userRole)) {
        // Déconnecter l'utilisateur immédiatement si le rôle ne correspond pas
        await auth.signOut()
        
        // Déterminer le type réel du compte pour le message d'erreur
        const roleToType: Record<string, string> = {
          'super_admin': 'Super Admin',
          'archdiocese_admin': 'Archidiocèse',
          'diocese_admin': 'Diocèse',
          'parish_admin': 'Paroisse',
          'church_admin': 'Église'
        }
        
        const typeLabels: Record<string, string> = {
          'admin': 'Super Admin',
          'archdiocese': 'Archidiocèse',
          'diocese': 'Diocèse',
          'paroisse': 'Paroisse',
          'eglise': 'Église'
        }
        
        const actualType = roleToType[userRole] || 'inconnu'
        const selectedType = typeLabels[loginType]
        
        throw new Error(`Cet utilisateur n'est pas un compte ${selectedType}. C'est un compte ${actualType}. Veuillez sélectionner le bon type de compte.`)
      }
      
      // Rediriger vers le dashboard après connexion
      router.push("/admin/dashboard")
    } catch (error: any) {
      // Gérer les erreurs Firebase de manière user-friendly
      let errorMessage = "Email ou mot de passe incorrect"
      
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-credential":
          case "auth/wrong-password":
          case "auth/user-not-found":
          case "auth/invalid-email":
            errorMessage = "Email ou mot de passe incorrect"
            break
          case "auth/too-many-requests":
            errorMessage = "Trop de tentatives. Veuillez réessayer plus tard"
            break
          case "auth/user-disabled":
            errorMessage = "Ce compte a été désactivé"
            break
          case "auth/network-request-failed":
            errorMessage = "Erreur de connexion. Vérifiez votre connexion internet"
            break
          default:
            // Pour les autres erreurs, utiliser un message générique
            errorMessage = "Email ou mot de passe incorrect"
        }
      }
      
      setError(errorMessage)
      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Church className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Connexion SamaQuete
          </CardTitle>
          <p className="text-gray-600 mt-2">Accès à l'interface d'administration</p>
        </CardHeader>
        
        <CardContent>
          {/* Sélecteur de type de connexion - Filtre opérationnel */}
          <div className="mb-6 space-y-2">
            <p className="text-xs text-gray-600 text-center mb-2">
              Sélectionnez le type de compte pour vous connecter
            </p>
            {/* Ligne 1: Super Admin, Archidiocèse, Diocèse */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-md transition-colors ${
                  loginType === 'admin'
                    ? 'bg-red-50 text-red-600 shadow-sm border-2 border-red-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType('archdiocese')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-md transition-colors ${
                  loginType === 'archdiocese'
                    ? 'bg-orange-50 text-orange-600 shadow-sm border-2 border-orange-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-medium">Archidiocèse</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType('diocese')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-md transition-colors ${
                  loginType === 'diocese'
                    ? 'bg-yellow-50 text-yellow-600 shadow-sm border-2 border-yellow-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium">Diocèse</span>
              </button>
            </div>
            
            {/* Ligne 2: Paroisse, Église */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLoginType('paroisse')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg transition-colors ${
                  loginType === 'paroisse'
                    ? 'bg-green-50 text-green-600 shadow-sm border-2 border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-xs font-medium">Paroisse</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType('eglise')}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-lg transition-colors ${
                  loginType === 'eglise'
                    ? 'bg-blue-50 text-blue-600 shadow-sm border-2 border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Church className="w-4 h-4" />
                <span className="text-xs font-medium">Église</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
