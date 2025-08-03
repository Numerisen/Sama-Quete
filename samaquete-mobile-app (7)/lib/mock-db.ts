import { v4 as uuidv4 } from "uuid"

export interface Diocese {
  id: string
  name: string
  location: string
  description: string
  image_url?: string
  created_at: string
}

export interface News {
  id: string
  title: string
  content: string
  published_at: string
  expires_at?: string
  category: string
  priority: string
  image_url?: string
  target_type: "national" | "diocese" | "parish"
  target_id?: string
  created_by?: string // Mock user ID
  created_at: string
}

// Initial mock data
let mockDioceses: Diocese[] = [
  {
    id: uuidv4(),
    name: "Archidiocèse de Dakar",
    location: "Dakar",
    description: "Cathédrale principale de Dakar",
    image_url: "/placeholder.svg?height=120&width=200",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Diocèse de Thiès",
    location: "Thiès",
    description: "Au cœur de la région de Thiès",
    image_url: "/placeholder.svg?height=120&width=200",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Diocèse de Kaolack",
    location: "Kaolack",
    description: "Diocèse du centre-ouest du Sénégal",
    image_url: "/placeholder.svg?height=120&width=200",
    created_at: new Date().toISOString(),
  },
]

const mockNews: News[] = [
  {
    id: uuidv4(),
    title: "Célébration de la Journée Mondiale de la Jeunesse",
    content:
      "Rejoignez-nous pour une journée spéciale dédiée aux jeunes de notre paroisse avec des activités spirituelles et culturelles.",
    published_at: new Date().toISOString(),
    category: "Événement",
    priority: "high",
    image_url: "/placeholder.svg?height=200&width=300",
    target_type: "national",
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Collecte pour les familles nécessiteuses",
    content:
      "Notre paroisse organise une collecte de vivres et de vêtements pour soutenir les familles en difficulté de notre communauté.",
    published_at: new Date().toISOString(),
    category: "Solidarité",
    priority: "medium",
    image_url: "/placeholder.svg?height=200&width=300",
    target_type: "diocese",
    target_id: mockDioceses[0].id, // Link to Dakar diocese
    created_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: "Retraite spirituelle de Carême",
    content:
      "Préparez-vous au temps du Carême avec une retraite spirituelle de trois jours animée par le Père Antoine Diop.",
    published_at: new Date().toISOString(),
    category: "Formation",
    priority: "high",
    image_url: "/placeholder.svg?height=200&width=300",
    target_type: "national",
    created_at: new Date().toISOString(),
  },
]

export const db = {
  dioceses: {
    getAll: async (): Promise<Diocese[]> => {
      // Simulate async operation
      return Promise.resolve([...mockDioceses])
    },
    getById: async (id: string): Promise<Diocese | undefined> => {
      return Promise.resolve(mockDioceses.find((d) => d.id === id))
    },
    create: async (data: Omit<Diocese, "id" | "created_at">): Promise<Diocese> => {
      const newDiocese: Diocese = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        ...data,
      }
      mockDioceses.push(newDiocese)
      return Promise.resolve(newDiocese)
    },
    update: async (id: string, data: Partial<Omit<Diocese, "id" | "created_at">>): Promise<Diocese | undefined> => {
      const index = mockDioceses.findIndex((d) => d.id === id)
      if (index > -1) {
        mockDioceses[index] = { ...mockDioceses[index], ...data }
        return Promise.resolve(mockDioceses[index])
      }
      return Promise.resolve(undefined)
    },
    delete: async (id: string): Promise<boolean> => {
      const initialLength = mockDioceses.length
      mockDioceses = mockDioceses.filter((d) => d.id !== id)
      return Promise.resolve(mockDioceses.length < initialLength)
    },
  },
  news: {
    getAll: async (): Promise<News[]> => {
      return Promise.resolve([...mockNews])
    },
    // Add create, update, delete for news if needed later
  },
}
