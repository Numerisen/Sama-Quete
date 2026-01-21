"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { getUserRole } from '@/lib/user-service'
import { Church, Loader2, Shield, Home, Building2, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'admin' | 'archdiocese' | 'diocese' | 'paroisse' | 'eglise'>('admin')
  
  const { signIn, logout } = useAuth()
  const router = useRouter()

  // Mapper les types de login vers les rôles Firebase
  const loginTypeToRole: Record<string, string> = {
    'admin': 'super_admin',
    'archdiocese': 'archdiocese_admin',
    'diocese': 'diocese_admin',
    'paroisse': 'parish_admin',
    'eglise': 'church_admin'
  }

  const loginTypeLabels: Record<string, string> = {
    'admin': 'Super Admin',
    'archdiocese': 'Admin Archidiocèse',
    'diocese': 'Admin Diocèse',
    'paroisse': 'Admin Paroisse',
    'eglise': 'Admin Église'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1) Connexion Firebase
      const userCredential = await signIn(email, password)
      
      // 2) Récupérer le rôle de l'utilisateur depuis Firestore
      const userRole = await getUserRole(userCredential.user.uid)
      
      // 3) Vérifier que le rôle correspond au type de login sélectionné
      const expectedRole = loginTypeToRole[loginType]
      
      if (!userRole) {
        await logout()
        setError('Aucun rôle trouvé pour ce compte. Contactez l\'administrateur.')
        return
      }

      if (userRole.role !== expectedRole) {
        await logout()
        setError(`Ce compte n'a pas les permissions "${loginTypeLabels[loginType]}". Votre rôle: ${loginTypeLabels[Object.keys(loginTypeToRole).find(k => loginTypeToRole[k] === userRole.role) || 'inconnu']}.`)
        return
      }

      if (!userRole.isActive) {
        await logout()
        setError('Ce compte est désactivé. Contactez l\'administrateur.')
        return
      }
      
      // 4) Si tout est OK, rediriger
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/placeholder-logo.png" alt="SamaQuete" className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Connexion SamaQuete
          </CardTitle>
          <p className="text-gray-600">Accès à l'interface d'administration</p>
        </CardHeader>
        
        <CardContent>
          {/* Sélecteur de type de connexion - 5 niveaux hiérarchiques */}
          <div className="mb-6 space-y-2">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@admin.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              className="w-full"
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
