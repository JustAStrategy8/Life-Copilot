import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { openai } from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId required' });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const summaryInput = (entries ?? []).map(e => ({
    date: e.created_at,
    type: e.type,
    text: e.text,
    emotion: e.emotion,
    energy: e.energy,
    tags: e.tags,
    notes: e.notes,
  }));

  const prompt = `
You are an AI life co-pilot.

You will receive a list of structured entries from the past 7 days.

1. Identify 3–5 patterns about:
   - what energised the user
   - what drained them
   - where they felt effective or stuck

2. Express insights as:
   - short observations
   - "if–then" rules
   - 1–2 suggested experiments for next week

Be honest but kind. Emphasise these are hypotheses, not facts.

Entries:
${JSON.stringify(summaryInput, null, 2)}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  const insights = completion.choices[0].message.content ?? '';

  res.status(200).json({ entries: summaryInput, insights });
}

