// /api/moderate.js
import { OpenAI } from "openai";

export default async function handler(req, res) {
  const { input } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key." });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.moderations.create({ input });
    return res.status(200).json({ flagged: response.results[0].flagged });
  } catch (err) {
    console.error("Moderation error:", err);
    return res.status(500).json({ error: "Moderation failed." });
  }
}