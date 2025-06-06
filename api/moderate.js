// api/moderate.js
import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { input } = req.body || {};
  if (!input) {
    return res.status(400).json({ error: "Missing `input` in request body." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call the moderation endpoint
    const modResponse = await openai.moderations.create({
      input: input,
    });

    // According to OpenAI’s docs, `results[0].flagged` is true if the content is disallowed
    const flagged = modResponse.results[0].flagged;
    return res.status(200).json({ flagged });
  } catch (err) {
    console.error("Moderation error:", err);
    return res.status(500).json({ error: "Moderation check failed." });
  }
}