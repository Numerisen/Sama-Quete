"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Composant Form réutilisable pour les vues CRUD admin
 * 
 * Props:
 * - fields: Array<{ name: string, label: string, type: string, placeholder?: string, required?: boolean, options?: Array, ... }>
 * - initialData?: object
 * - onSubmit: (data) => Promise<void>
 * - onCancel?: () => void
 * - loading?: boolean
 * - title?: string
 * - submitLabel?: string
 */
export default function Form({
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  title = "Formulaire",
  submitLabel = "Enregistrer",
  cancelLabel = "Annuler",
  className = ""
}) {
  const { toast } = useToast()
  const [formData, setFormData] = React.useState(initialData)
  const [errors, setErrors] = React.useState({})

  React.useEffect(() => {
    setFormData(initialData)
    setErrors({})
  }, [initialData])

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} est obligatoire`
      }
      
      // Validation personnalisée
      if (field.validate && formData[field.name]) {
        const error = field.validate(formData[field.name], formData)
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive"
      })
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      })
    }
  }

  const renderField = (field) => {
    const value = formData[field.name] ?? field.defaultValue ?? ''
    const error = errors[field.name]
    const fieldId = `field-${field.name}`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'date':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {field.label}
            </Label>
            <Input
              id={fieldId}
              type={field.type}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {field.label}
            </Label>
            <Textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled || loading}
              rows={field.rows || 4}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {field.label}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleChange(field.name, newValue)}
              disabled={field.disabled || loading}
            >
              <SelectTrigger id={fieldId} className={error ? "border-red-500" : ""}>
                <SelectValue placeholder={field.placeholder || "Sélectionner..."} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          </div>
        )

      case 'switch':
        return (
          <div key={field.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor={fieldId} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                {field.label}
              </Label>
              {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
            </div>
            <Switch
              id={fieldId}
              checked={value}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              disabled={field.disabled || loading}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>
        )

      case 'custom':
        return (
          <div key={field.name} className="space-y-2">
            {field.label && (
              <Label htmlFor={fieldId} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                {field.label}
              </Label>
            )}
            {field.render && field.render(value, (newValue) => handleChange(field.name, newValue), formData)}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={`shadow-xl bg-white/80 border-0 rounded-2xl ${className}`}>
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-black mb-1">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => renderField(field))}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                {cancelLabel}
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-900 hover:bg-blue-800 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
