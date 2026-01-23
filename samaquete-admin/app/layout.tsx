import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ErrorFilterScript } from "@/components/ErrorFilterScript"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sama-Quête Admin",
  description: "Interface d'administration Sama-Quête",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ErrorFilterScript />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
