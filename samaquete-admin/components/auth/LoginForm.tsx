"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { Church, Loader2, Shield, Home, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState<'admin' | 'diocese' | 'paroisse' | 'eglise'>('admin')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      
      // La redirection sera gérée par la page racine et ProtectedRoute
      // qui attendront que le rôle soit chargé depuis Firestore
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
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
          {/* Sélecteur de type de connexion */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-xs bg-gray-100 ${
                loginType === 'admin'
                  ? 'bg-amber-100 text-amber-600 shadow-sm border-2 border-amber-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginType('diocese')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-xs bg-gray-100 ${
                loginType === 'diocese'
                  ? 'bg-amber-100 text-amber-600 shadow-sm border-2 border-amber-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Church className="w-4 h-4" />
              Admin Diocèse
            </button>
            <button
              type="button"
              onClick={() => setLoginType('paroisse')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-xs bg-gray-100 ${
                loginType === 'paroisse'
                  ? 'bg-green-100 text-green-600 shadow-sm border-2 border-green-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Home className="w-4 h-4" />
              Admin Paroisse
            </button>
            <button
              type="button"
              onClick={() => setLoginType('eglise')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-xs bg-gray-100 ${
                loginType === 'eglise'
                  ? 'bg-emerald-100 text-emerald-600 shadow-sm border-2 border-emerald-300'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Admin Église
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  loginType === 'admin' ? 'admin@admin.com' :
                  loginType === 'diocese' ? 'diocese@diocese.com' :
                  loginType === 'paroisse' ? 'admin.paroisse@test.com' :
                  'admin.eglise@test.com'
                }
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

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Comptes de test :</p>
            <div className="mt-2 space-y-1">
              <p><strong>Super Admin:</strong> admin@admin.com</p>
              <p><strong>Admin Diocèse:</strong> diocese@diocese.com</p>
              <p><strong>Admin Paroisse:</strong> admin.paroisse@test.com</p>
              <p><strong>Admin Église:</strong> admin.eglise@test.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
