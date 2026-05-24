import type { NextApiRequest, NextApiResponse } from 'next';
import { openai } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  const prompt = `
You analyse personal journal entries.

Given the entry, respond in JSON with:
- "emotions": list of 1–3 emotions
- "energy": "energising" | "neutral" | "draining"
- "topics": list of 1–5 short topic tags
- "notes": 1–2 short bullet points about what seems important.

Entry:
"${text}"
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You return ONLY valid JSON.' },
      { role: 'user', content: prompt },
    ],
  });

  const content = completion.choices[0].message.content ?? '{}';
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { emotions: [], energy: 'neutral', topics: [], notes: [] };
  }

  res.status(200).json(parsed);
}

