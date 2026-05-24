import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, type, text, analysis } = req.body;
  if (!userId || !type || !text) {
    return res.status(400).json({ error: 'userId, type, text required' });
  }

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: userId,
      type,
      text,
      tags: analysis?.topics ?? [],
      emotion: analysis?.emotions?.[0] ?? null,
      energy: analysis?.energy ?? 'neutral',
      notes: Array.isArray(analysis?.notes) ? analysis.notes.join(' • ') : null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
}

