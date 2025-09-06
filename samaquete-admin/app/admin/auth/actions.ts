"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { db, type AdminUser } from "@/lib/mock-db" // Import db and AdminUser type

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Simulate authentication using mock db
  const user = await db.adminUsers.getByEmail(email)

  if (user && user.password_hash === password) {
    // Set a mock session cookie with the full user object
    cookies().set("admin_session", JSON.stringify(user), {
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

export async function getAdminUser(): Promise<AdminUser | null> {
  const sessionCookie = cookies().get("admin_session")?.value
  if (!sessionCookie) {
    return null
  }

  try {
    const user: AdminUser = JSON.parse(sessionCookie)
    // In a real app, you'd validate this session with a backend/DB
    // For mock, we just return the parsed user if it exists in our mock db
    const foundUser = await db.adminUsers.getById(user.id)
    if (foundUser && foundUser.email === user.email && foundUser.role === user.role) {
      return foundUser
    }
    return null
  } catch (e) {
    console.error("Failed to parse admin session cookie:", e)
    return null
  }
}
