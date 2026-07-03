import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID!,
  dataset: process.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // server-only write token
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow requests from your domain only
  res.setHeader("Access-Control-Allow-Origin", "https://www.ghamsu.org");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { id, action } = req.body;

  if (!id || !["like", "view"].includes(action)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const field = action === "like" ? "likes" : "views";

    const updated = await client
      .patch(id)
      .setIfMissing({ [field]: 0 })
      .inc({ [field]: 1 })
      .commit({ returnDocuments: true });

    return res.status(200).json({
      likes: updated.likes ?? 0,
      views: updated.views ?? 0,
    });
  } catch (err) {
    console.error("Sanity patch error:", err);
    return res.status(500).json({ error: "Failed to update" });
  }
}