import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import styles from './NotesPage.module.css';

const NOTE_COLORS = [
  { label: 'Violet', val: '#7c6ff7', bg: 'rgba(124,111,247,0.08)' },
  { label: 'Green',  val: '#34d399', bg: 'rgba(52,211,153,0.08)' },
  { label: 'Pink',   val: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
  { label: 'Amber',  val: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  { label: 'Blue',   val: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
];

export default function NotesPage() {
  const [notes, setNotes] = useLocalStorage('studyai_notes', []);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [colorIdx, setColorIdx] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  const saveNote = () => {
    if (!content.trim()) return;
    const note = {
      id: Date.now().toString(),
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      color: NOTE_COLORS[colorIdx].val,
      colorBg: NOTE_COLORS[colorIdx].bg,
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [note, ...prev]);
    setTitle(''); setContent(''); setAdding(false);
  };

  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Notes</h2>
          <p className={styles.subtitle}>{notes.length} saved · Stored locally</p>
        </div>
        <button className={styles.addBtn} onClick={() => setAdding(a => !a)}>
          {adding ? '✕ Cancel' : '+ New Note'}
        </button>
      </div>

      {notes.length > 2 && (
        <input
          className={styles.search}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..."
        />
      )}

      {adding && (
        <div className={styles.form}>
          <input
            className={styles.titleInput}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Note title..."
          />
          <textarea
            className={styles.contentInput}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your note here... (Markdown supported)"
            rows={8}
          />
          <div className={styles.formFooter}>
            <div className={styles.colorRow}>
              {NOTE_COLORS.map((c, i) => (
                <button
                  key={i}
                  className={`${styles.colorBtn} ${colorIdx === i ? styles.activeColor : ''}`}
                  style={{ background: c.val }}
                  onClick={() => setColorIdx(i)}
                  title={c.label}
                />
              ))}
            </div>
            <button className={styles.saveBtn} onClick={saveNote} disabled={!content.trim()}>Save Note</button>
          </div>
        </div>
      )}

      {notes.length === 0 && !adding ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📝</div>
          <p>No notes yet. Start by asking the AI and saving answers as notes!</p>
          <button className={styles.addBtn} onClick={() => setAdding(true)}>+ New Note</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((note, i) => (
            <div
              key={note.id}
              className={`${styles.noteCard} ${expanded === note.id ? styles.expanded : ''}`}
              style={{ '--note-color': note.color, '--note-bg': note.colorBg, animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.noteBar} style={{ background: note.color }} />
              <div className={styles.noteContent}>
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <div className={styles.noteActions}>
                    <button className={styles.iconBtn} onClick={() => setExpanded(expanded === note.id ? null : note.id)} title="Expand">
                      {expanded === note.id ? '⊟' : '⊞'}
                    </button>
                    <button className={styles.iconBtn} onClick={() => navigator.clipboard.writeText(note.content)} title="Copy">⎘</button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} onClick={() => deleteNote(note.id)} title="Delete">✕</button>
                  </div>
                </div>
                <div className={`${styles.noteBody} ${expanded === note.id ? styles.noteBodyFull : ''}`}>
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                  </div>
                </div>
                <div className={styles.noteMeta}>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
