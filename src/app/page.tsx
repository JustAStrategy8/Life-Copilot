'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [insights, setInsights] = useState('');

  const userId = 'mock-user'; // replace with Supabase auth later

  async function saveEntry() {
    const analysis = await fetch('/api/analyse-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    }).then(r => r.json());

    await fetch('/api/add-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type: 'journal', text, analysis }),
    });

    setText('');
  }

  async function loadInsights() {
    const data = await fetch(`/api/insights?userId=${userId}`).then(r => r.json());
    setInsights(data.insights);
  }

  return (
    <main className="p-6 max-w-xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4">Life Copilot</h1>

      <textarea
        className="w-full h-40 p-3 bg-slate-900 rounded"
        placeholder="Write your thoughts..."
        value={text}
        onChange={e => setText(e.target.value)}
      />

      <button onClick={saveEntry} className="mt-3 px-4 py-2 bg-emerald-500 rounded">
        Save Entry
      </button>

      <button onClick={loadInsights} className="mt-3 ml-3 px-4 py-2 bg-indigo-500 rounded">
        Weekly Insights
      </button>

      {insights && (
        <div className="mt-6 p-4 bg-slate-800 rounded whitespace-pre-wrap">
          {insights}
        </div>
      )}
    </main>
  );
}

