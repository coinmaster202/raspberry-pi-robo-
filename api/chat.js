import fetch from 'node-fetch'; // ADD THIS if not using Node 18+

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API key in environment.' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...messages
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    const data = await openaiRes.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.choices || !data.choices.length || !data.choices[0].message) {
      return res.status(500).json({ error: 'No reply from OpenAI' });
    }

    return res.status(200).json({ reply: data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return res.status(500).json({ error: 'Failed to contact OpenAI API.' });
  }
}