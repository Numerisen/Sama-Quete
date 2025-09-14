"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFirestoreProfileForExistingUser } from '@/lib/init-users'
import { Database, Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'

// Cette page doit être accessible sans protection de rôle
// car c'est elle qui crée les rôles !

export default function InitUsersPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    uid: '',
    email: '',
    displayName: '',
    role: 'super_admin' as 'super_admin' | 'diocese_admin' | 'parish_admin' | 'user'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await createFirestoreProfileForExistingUser(
        formData.uid,
        formData.email,
        formData.displayName,
        formData.role
      )
      setMessage(`✅ Profil Firestore créé avec succès pour ${formData.email}`)
      setFormData({ uid: '', email: '', displayName: '', role: 'super_admin' })
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Initialisation des profils Firestore
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription>
                <strong>Instructions :</strong> Cette page permet de créer des profils Firestore pour les utilisateurs existants dans Firebase Auth.
                <br />
                <br />
                <strong>Étapes :</strong>
                <br />
                1. Allez dans la console Firebase → Authentication → Users
                <br />
                2. Copiez l'UID de l'utilisateur
                <br />
                3. Remplissez le formulaire ci-dessous
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="uid">UID Firebase (obligatoire)</Label>
                <Input
                  id="uid"
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  placeholder="aC9QNeVKXFNKIMQvtTy01Yy..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@admin.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nom d'affichage</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Super Administrateur"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Administrateur</SelectItem>
                    <SelectItem value="diocese_admin">Administrateur Diocèse</SelectItem>
                    <SelectItem value="parish_admin">Administrateur Paroisse</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer le profil Firestore
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">UIDs des utilisateurs existants :</h3>
              <div className="text-sm space-y-1">
                <p><strong>admin@admin.com:</strong> [Copiez depuis Firebase Console]</p>
                <p><strong>diocese@admin.com:</strong> [Copiez depuis Firebase Console]</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}