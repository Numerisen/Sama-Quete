import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Protection des routes admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // La vérification d'authentification se fera côté client
    // car Firebase Auth nécessite le contexte du navigateur
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
