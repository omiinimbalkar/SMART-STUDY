import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import styles from './FlashcardsPage.module.css';

const COLORS = ['#7c6ff7', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#f87171'];

export default function FlashcardsPage() {
  const [cards, setCards] = useLocalStorage('studyai_flashcards', []);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [topic, setTopic] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [flipped, setFlipped] = useState({});
  const [adding, setAdding] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [studyIdx, setStudyIdx] = useState(0);

  const addCard = () => {
    if (!front.trim() || !back.trim()) return;
    const card = { id: Date.now().toString(), front: front.trim(), back: back.trim(), topic: topic.trim() || 'General', color, createdAt: new Date() };
    setCards(prev => [card, ...prev]);
    setFront(''); setBack(''); setTopic(''); setAdding(false);
  };

  const removeCard = (id) => setCards(prev => prev.filter(c => c.id !== id));

  const toggleFlip = (id) => setFlipped(prev => ({ ...prev, [id]: !prev[id] }));

  const topics = [...new Set(cards.map(c => c.topic))];

  if (studyMode && cards.length > 0) {
    const card = cards[studyIdx % cards.length];
    const isFlipped = !!flipped[`study_${studyIdx}`];
    return (
      <div className={styles.studyMode}>
        <div className={styles.studyHeader}>
          <button className={styles.exitBtn} onClick={() => { setStudyMode(false); setStudyIdx(0); setFlipped({}); }}>← Exit Study</button>
          <span className={styles.studyCount}>{studyIdx + 1} / {cards.length}</span>
        </div>
        <div className={`${styles.studyCard} ${isFlipped ? styles.flipped : ''}`} onClick={() => toggleFlip(`study_${studyIdx}`)}>
          <div className={styles.studyCardInner}>
            <div className={styles.studyFront} style={{ borderTop: `4px solid ${card.color}` }}>
              <span className={styles.cardSide}>Question</span>
              <p>{card.front}</p>
              <span className={styles.tapHint}>Tap to reveal answer</span>
            </div>
            <div className={styles.studyBack} style={{ background: `${card.color}18`, borderTop: `4px solid ${card.color}` }}>
              <span className={styles.cardSide}>Answer</span>
              <p>{card.back}</p>
            </div>
          </div>
        </div>
        <div className={styles.studyNav}>
          <button className={styles.navBtn} onClick={() => { setStudyIdx(i => Math.max(0, i - 1)); setFlipped({}); }} disabled={studyIdx === 0}>← Prev</button>
          <button className={styles.navBtn} onClick={() => { setStudyIdx(i => (i + 1) % cards.length); setFlipped({}); }}>Next →</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Flashcards</h2>
          <p className={styles.subtitle}>{cards.length} card{cards.length !== 1 ? 's' : ''} · Saved locally</p>
        </div>
        <div className={styles.headerActions}>
          {cards.length > 0 && (
            <button className={styles.studyBtn} onClick={() => setStudyMode(true)}>▶ Study Mode</button>
          )}
          <button className={styles.addBtn} onClick={() => setAdding(a => !a)}>
            {adding ? '✕ Cancel' : '+ New Card'}
          </button>
        </div>
      </div>

      {adding && (
        <div className={styles.form}>
          <h3 className={styles.formTitle}>Create Flashcard</h3>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>Front (Question)</label>
              <textarea value={front} onChange={e => setFront(e.target.value)} placeholder="Enter question or term..." rows={3} />
            </div>
            <div className={styles.field}>
              <label>Back (Answer)</label>
              <textarea value={back} onChange={e => setBack(e.target.value)} placeholder="Enter answer or definition..." rows={3} />
            </div>
          </div>
          <div className={styles.formMeta}>
            <div className={styles.field}>
              <label>Topic (optional)</label>
              <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Biology, Math..." />
            </div>
            <div className={styles.colorPicker}>
              <label>Color</label>
              <div className={styles.colors}>
                {COLORS.map(c => (
                  <button key={c} className={`${styles.colorDot} ${color === c ? styles.selected : ''}`}
                    style={{ background: c }} onClick={() => setColor(c)} />
                ))}
              </div>
            </div>
          </div>
          <button className={styles.saveBtn} onClick={addCard} disabled={!front.trim() || !back.trim()}>Save Card</button>
        </div>
      )}

      {topics.length > 0 && (
        <div className={styles.topicFilters}>
          {topics.map(t => (
            <span key={t} className={styles.topicTag}>{t} · {cards.filter(c => c.topic === t).length}</span>
          ))}
        </div>
      )}

      {cards.length === 0 && !adding ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🗂</div>
          <p>No flashcards yet. Create your first one!</p>
          <button className={styles.addBtn} onClick={() => setAdding(true)}>+ Create Flashcard</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {cards.map((card, i) => (
            <div
              key={card.id}
              className={`${styles.card} ${flipped[card.id] ? styles.flipped : ''}`}
              style={{ animationDelay: `${i * 0.05}s`, '--card-color': card.color }}
              onClick={() => toggleFlip(card.id)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardFront}>
                  <span className={styles.cardTopic}>{card.topic}</span>
                  <p className={styles.cardText}>{card.front}</p>
                  <span className={styles.flipHint}>Click to flip</span>
                </div>
                <div className={styles.cardBack}>
                  <span className={styles.cardTopic}>Answer</span>
                  <p className={styles.cardText}>{card.back}</p>
                </div>
              </div>
              <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); removeCard(card.id); }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
