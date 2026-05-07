import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createClient } from "@sanity/client"

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: process.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

const ALLOWED_ORIGINS = [
  "https://www.ghamsu.org",
  "https://ghamsu.vercel.app",
  "http://localhost:5173",
]

function setCors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || ""

  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)

  res.setHeader("Access-Control-Allow-Origin", isAllowed ? origin : ALLOWED_ORIGINS[0])
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.setHeader("Vary", "Origin")
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res)

  if (req.method === "OPTIONS") {
    return res.status(204).end()
  }

  try {
    if (req.method === "GET") {
      const id = req.query.id as string

      if (!id) {
        return res.status(400).json({ error: "Post id is required" })
      }

      const post = await client.fetch(
        `*[_id == $id][0]{likes, views}`,
        { id }
      )

      return res.status(200).json({
        likes: post?.likes ?? 0,
        views: post?.views ?? 0,
      })
    }

    if (req.method === "POST") {
      const { id, action } = req.body

      if (!id || !["like", "view"].includes(action)) {
        return res.status(400).json({
          error: "Invalid request — id and action (like|view) are required",
        })
      }

      const field = action === "like" ? "likes" : "views"

      const updated = await client
        .patch(id)
        .setIfMissing({ likes: 0, views: 0 })
        .inc({ [field]: 1 })
        .commit({ returnDocuments: true })

      return res.status(200).json({
        likes: updated.likes ?? 0,
        views: updated.views ?? 0,
      })
    }

    return res.status(405).json({ error: "Method not allowed" })
  } catch (err) {
    console.error("[blog-stats] API error:", err)
    return res.status(500).json({ error: "Failed to process blog stats" })
  }
}