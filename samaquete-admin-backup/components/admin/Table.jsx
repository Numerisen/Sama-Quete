"use client"

import React from 'react'
import {
  Table as UITable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw } from 'lucide-react'

/**
 * Composant Table réutilisable pour les vues admin
 * 
 * Props:
 * - columns: Array<{ key: string, label: string, render?: (item) => ReactNode }>
 * - data: Array<any>
 * - loading?: boolean
 * - searchable?: boolean
 * - filterable?: boolean
 * - actions?: Array<{ label: string, onClick: (item) => void, variant?: string, icon?: ReactNode }>
 * - onRefresh?: () => void
 */
export default function Table({
  columns = [],
  data = [],
  loading = false,
  searchable = false,
  filterable = false,
  filters = {},
  onFilterChange = () => {},
  actions = [],
  onRefresh,
  emptyMessage = "Aucune donnée trouvée",
  searchPlaceholder = "Rechercher...",
  className = ""
}) {
  const [search, setSearch] = React.useState("")

  const filteredData = React.useMemo(() => {
    let result = data

    // Recherche
    if (searchable && search) {
      result = result.filter(item =>
        columns.some(col => {
          const value = item[col.key]
          return value && String(value).toLowerCase().includes(search.toLowerCase())
        })
      )
    }

    // Filtres
    if (filterable) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          result = result.filter(item => {
            const itemValue = item[key]
            return String(itemValue) === String(value)
          })
        }
      })
    }

    return result
  }, [data, search, filters, searchable, filterable, columns])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barre de recherche et filtres */}
      {(searchable || filterable || onRefresh) && (
        <div className="flex flex-wrap gap-4 items-center">
          {searchable && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {filterable && Object.entries(filters).map(([key, value]) => {
            const filterConfig = columns.find(col => col.key === key && col.filterOptions)
            if (!filterConfig) return null

            return (
              <Select
                key={key}
                value={value || 'all'}
                onValueChange={(newValue) => onFilterChange({ ...filters, [key]: newValue })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`Filtrer par ${filterConfig.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filterConfig.filterOptions?.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          })}

          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          )}
        </div>
      )}

      {/* Tableau */}
      <div className="rounded-md border">
        <UITable>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.className || ""}>
                  {col.label}
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-gray-500">Chargement...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <p className="text-gray-500">{emptyMessage}</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className || ""}>
                      {col.render ? col.render(item) : (
                        <span>{item[col.key] || '-'}</span>
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {actions.map((action, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant={action.variant || "outline"}
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled?.(item)}
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </UITable>
      </div>

      {/* Informations de pagination (optionnel) */}
      {filteredData.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {filteredData.length} résultat(s) trouvé(s)
        </div>
      )}
    </div>
  )
}
