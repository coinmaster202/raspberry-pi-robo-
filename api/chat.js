// /api/chat.js
import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key in environment." });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    return res.status(200).json({ reply: chat.choices[0].message.content });
  } catch (err) {
    console.error("Chat API error:", err);
    return res.status(500).json({ error: "ChatGPT failed." });
  }
}