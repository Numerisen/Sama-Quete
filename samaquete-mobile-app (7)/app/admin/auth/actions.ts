"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

// Mock user data
const MOCK_ADMIN_USER = {
  id: "mock-admin-id-123",
  email: "admin@samaquete.com",
  adminProfile: {
    full_name: "Admin Général",
    role: "admin_general",
  },
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Simulate authentication
  if (email === MOCK_ADMIN_USER.email && password === "password") {
    // Set a mock session cookie
    cookies().set("admin_session", JSON.stringify(MOCK_ADMIN_USER), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })
    redirect("/admin/dashboard")
  } else {
    return { error: "Email ou mot de passe incorrect." }
  }
}

export async function signOut() {
  cookies().delete("admin_session")
  redirect("/admin/login")
}

export async function getAdminUser() {
  const sessionCookie = cookies().get("admin_session")?.value
  if (!sessionCookie) {
    return null
  }

  try {
    const user = JSON.parse(sessionCookie)
    // In a real app, you'd validate this session with a backend/DB
    // For mock, we just return the parsed user if it matches our mock user
    if (user.id === MOCK_ADMIN_USER.id) {
      return user
    }
    return null
  } catch (e) {
    console.error("Failed to parse admin session cookie:", e)
    return null
  }
}
