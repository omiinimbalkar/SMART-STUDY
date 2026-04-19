const BASE = import.meta.env.VITE_API_URL || '/api';

export async function askAI(question, history = []) {
  const res = await fetch(`${BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get answer.');
  }
  return res.json();
}

export async function saveFlashcard(card) {
  const res = await fetch(`${BASE}/flashcards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card)
  });
  return res.json();
}

export async function deleteFlashcard(id) {
  await fetch(`${BASE}/flashcards/${id}`, { method: 'DELETE' });
}

export async function saveNote(note) {
  const res = await fetch(`${BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note)
  });
  return res.json();
}
