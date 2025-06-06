// api/chat.js
import { OpenAI } from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Missing or invalid `messages` in request body." });
  }

  // The user’s latest message is the last array element with role "user".
  const userMsgObj = messages.slice().reverse().find((m) => m.role === "user");
  const userContent = userMsgObj?.content;
  if (!userContent) {
    return res.status(400).json({ error: "Missing a user‐role message in `messages`." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 1️⃣ Run moderation check on the user’s content
    const modResponse = await openai.moderations.create({
      input: userContent,
    });
    const flagged = modResponse.results[0].flagged;
    if (flagged) {
      // If flagged, immediately return an error to the front-end
      return res.status(403).json({ error: "Your message was flagged by OpenAI's moderation endpoint." });
    }

    // 2️⃣ If not flagged, call the GPT-3.5-turbo endpoint
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    const assistantReply = chatResponse.choices[0]?.message?.content;
    return res.status(200).json({ reply: assistantReply });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    return res.status(500).json({ error: "OpenAI chat request failed." });
  }
}