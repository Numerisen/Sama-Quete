"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-600"
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-600"
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-600"
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-600"
  }
}

function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg max-w-sm w-full`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${config.textColor}`}>{title}</h4>
          {message && (
            <p className={`text-sm mt-1 ${config.textColor} opacity-80`}>{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className={`${config.textColor} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook pour gérer les toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Date.now().toString()
    const newToast: ToastProps = {
      id,
      type,
      title,
      message,
      duration
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (title: string, message?: string) => addToast("success", title, message)
  const error = (title: string, message?: string) => addToast("error", title, message)
  const warning = (title: string, message?: string) => addToast("warning", title, message)
  const info = (title: string, message?: string) => addToast("info", title, message)

  return {
    toasts,
    success,
    error,
    warning,
    info,
    removeToast
  }
}
