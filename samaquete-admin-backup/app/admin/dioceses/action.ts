"use server"

import { revalidatePath } from "next/cache"
import { db, type Diocese } from "@/lib/mock-db" // Import mock db and type

export async function getDioceses(): Promise<Diocese[]> {
  return db.dioceses.getAll()
}

export async function getDioceseById(id: string): Promise<Diocese | undefined> {
  return db.dioceses.getById(id)
}

export async function createDiocese(formData: FormData) {
  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const description = formData.get("description") as string
  const imageUrl = formData.get("image_url") as string

  if (!name) {
    return { error: "Le nom du diocèse est requis." }
  }

  const newDioceseData: Omit<Diocese, "id" | "created_at"> = {
    name,
    location,
    description,
    image_url: imageUrl,
  }

  const result = await db.dioceses.create(newDioceseData)

  if (!result) {
    return { error: "Erreur lors de la création du diocèse." }
  }

  revalidatePath("/admin/dioceses")
  return { success: true }
}

export async function updateDiocese(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const description = formData.get("description") as string
  const imageUrl = formData.get("image_url") as string

  if (!id || !name) {
    return { error: "ID et nom du diocèse sont requis." }
  }

  const updatedDioceseData: Partial<Omit<Diocese, "id" | "created_at">> = {
    name,
    location,
    description,
    image_url: imageUrl,
  }

  const result = await db.dioceses.update(id, updatedDioceseData)

  if (!result) {
    return { error: "Diocèse non trouvé ou erreur lors de la mise à jour." }
  }

  revalidatePath("/admin/dioceses")
  revalidatePath(`/admin/dioceses/${id}/edit`)
  return { success: true }
}

export async function deleteDiocese(formData: FormData) {
  const id = formData.get("id") as string

  if (!id) {
    return { error: "ID du diocèse est requis." }
  }

  const result = await db.dioceses.delete(id)

  if (!result) {
    return { error: "Diocèse non trouvé ou erreur lors de la suppression." }
  }

  revalidatePath("/admin/dioceses")
  return { success: true }
}
