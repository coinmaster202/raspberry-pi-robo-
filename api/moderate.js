export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Missing input' });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You're a profanity filter. If the user message is inappropriate, respond ONLY with 'blocked'. If clean, ONLY 'safe'." },
          { role: "user", content: input }
        ],
        max_tokens: 1,
        temperature: 0
      })
    });

    const data = await response.json();
    const result = data.choices[0].message.content.trim().toLowerCase();

    res.status(200).json({ result });
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
