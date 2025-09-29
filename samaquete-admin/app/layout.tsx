import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import ThemeToggle from '@/components/ui/theme-toggle'
import { ToastProvider } from '@/components/ui/toast-provider'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SamaQuete Admin',
  description: 'Administration SamaQuete',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider />
            <div className="relative min-h-screen">
              {children}
              <div className="fixed bottom-4 right-4 z-50">
                <ThemeToggle />
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
