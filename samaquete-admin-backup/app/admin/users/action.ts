"use server"

import { revalidatePath } from "next/cache"
import { db, type AdminUser } from "@/lib/mock-db" // Import mock db and AdminUser type

export async function getAdminUsers(): Promise<AdminUser[]> {
  return db.adminUsers.getAll()
}

export async function getAdminUserById(id: string): Promise<AdminUser | undefined> {
  return db.adminUsers.getById(id)
}

export async function createAdminUser(formData: FormData) {
  const email = formData.get("email") as string
  const password_hash = formData.get("password") as string // In a real app, hash this!
  const full_name = formData.get("full_name") as string
  const role = formData.get("role") as AdminUser["role"]
  const diocese_id = formData.get("diocese_id") as string | undefined
  const parish_id = formData.get("parish_id") as string | undefined

  if (!email || !password_hash || !full_name || !role) {
    return { error: "Tous les champs obligatoires doivent être remplis." }
  }

  // Basic email format validation
  if (!/\S+@\S+\.\S+/.test(email)) {
    return { error: "Format d'email invalide." }
  }

  // Check if email already exists
  const existingUser = await db.adminUsers.getByEmail(email)
  if (existingUser) {
    return { error: "Un utilisateur avec cet email existe déjà." }
  }

  const newAdminUserData: Omit<AdminUser, "id" | "created_at" | "updated_at"> = {
    email,
    password_hash,
    full_name,
    role,
    diocese_id: role === "admin_diocesan" ? diocese_id : undefined,
    parish_id: role === "admin_parishial" ? parish_id : undefined,
  }

  const result = await db.adminUsers.create(newAdminUserData)

  if (!result) {
    return { error: "Erreur lors de la création de l'utilisateur admin." }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function updateAdminUser(formData: FormData) {
  const id = formData.get("id") as string
  const email = formData.get("email") as string
  const password_hash = formData.get("password") as string // Only update if provided
  const full_name = formData.get("full_name") as string
  const role = formData.get("role") as AdminUser["role"]
  const diocese_id = formData.get("diocese_id") as string | undefined
  const parish_id = formData.get("parish_id") as string | undefined

  if (!id || !email || !full_name || !role) {
    return { error: "ID et tous les champs obligatoires sont requis." }
  }

  const updatedAdminUserData: Partial<Omit<AdminUser, "id" | "created_at" | "updated_at">> = {
    email,
    full_name,
    role,
    diocese_id: role === "admin_diocesan" ? diocese_id : undefined,
    parish_id: role === "admin_parishial" ? parish_id : undefined,
  }

  if (password_hash) {
    updatedAdminUserData.password_hash = password_hash // Update password only if provided
  }

  const result = await db.adminUsers.update(id, updatedAdminUserData)

  if (!result) {
    return { error: "Utilisateur admin non trouvé ou erreur lors de la mise à jour." }
  }

  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${id}/edit`)
  return { success: true }
}

export async function deleteAdminUser(formData: FormData) {
  const id = formData.get("id") as string

  if (!id) {
    return { error: "ID de l'utilisateur admin est requis." }
  }

  const result = await db.adminUsers.delete(id)

  if (!result) {
    return { error: "Utilisateur admin non trouvé ou erreur lors de la suppression." }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
