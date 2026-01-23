"use client"

import { useEffect } from "react"

/**
 * Composant pour filtrer les erreurs inoffensives de la console
 * Ces erreurs proviennent généralement d'extensions de navigateur
 * qui tentent de communiquer avec les iframes Firebase Auth
 */
export function ErrorFilterScript() {
  useEffect(() => {
    // Sauvegarder la fonction console.error originale
    const originalError = console.error
    const originalWarn = console.warn

    // Fonction pour filtrer les erreurs inoffensives
    const shouldFilterError = (message: string): boolean => {
      const filteredMessages = [
        "The message port closed before a response was received",
        "Could not establish connection. Receiving end does not exist",
        "Extension context invalidated",
        "Receiving end does not exist",
      ]

      return filteredMessages.some((filtered) =>
        message.includes(filtered)
      )
    }

    // Remplacer console.error pour filtrer les erreurs inoffensives
    console.error = (...args: any[]) => {
      const message = args.join(" ")
      if (!shouldFilterError(message)) {
        originalError.apply(console, args)
      }
    }

    // Remplacer console.warn pour filtrer les warnings inoffensifs
    console.warn = (...args: any[]) => {
      const message = args.join(" ")
      if (!shouldFilterError(message)) {
        originalWarn.apply(console, args)
      }
    }

    // Gestionnaire d'erreurs global pour les erreurs non capturées
    const handleError = (event: ErrorEvent) => {
      if (shouldFilterError(event.message)) {
        event.preventDefault()
        return false
      }
    }

    // Gestionnaire pour les promesses rejetées non capturées
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason || "")
      if (shouldFilterError(message)) {
        event.preventDefault()
        return false
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    // Nettoyage au démontage
    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null
}
