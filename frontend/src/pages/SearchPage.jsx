import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askAI, saveNote } from '../utils/api.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import styles from './SearchPage.module.css';

const SUGGESTIONS = [
  'Explain photosynthesis in simple terms',
  'What is Newton\'s second law of motion?',
  'How does the human digestive system work?',
  'What caused World War 1?',
  'Explain the Pythagorean theorem with examples',
  'What is mitosis vs meiosis?',
];

export default function SearchPage({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useLocalStorage('studyai_history', []);
  const [showHistory, setShowHistory] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const inputRef = useRef(null);
  const answerRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError('');
    setAnswer(null);
    setRelated([]);
    setSaved(false);
    setShowHistory(false);
    setQuery(trimmed);

    try {
      const { answer: ans, relatedQuestions } = await askAI(trimmed, aiHistory);
      setAnswer(ans);
      setRelated(relatedQuestions || []);
      setAiHistory(prev => [
        ...prev.slice(-6),
        { role: 'user', content: trimmed },
        { role: 'assistant', content: ans }
      ]);
      setHistory(prev => [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, 20));
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    if (e.key === 'Escape') setShowHistory(false);
  };

  const handleSaveNote = async () => {
    try {
      await saveNote({ title: query.slice(0, 60), content: answer, question: query });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setSaved(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(answer || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveFlashcard = () => {
    const front = query;
    const back = answer?.replace(/[#*`]/g, '').slice(0, 300) + '...';
    const existing = JSON.parse(localStorage.getItem('studyai_flashcards') || '[]');
    const card = { id: Date.now().toString(), front, back, topic: 'AI Answer', color: '#7c6ff7', createdAt: new Date() };
    localStorage.setItem('studyai_flashcards', JSON.stringify([card, ...existing]));
    onNavigate('flashcards');
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <h1 className={styles.heroTitle}>
          <span>Ask anything.</span>
          <span className={styles.heroAccent}> Learn everything.</span>
        </h1>
        <p className={styles.heroSub}>Your AI-powered study companion — instant answers, beautifully explained.</p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchWrap}>
        <div className={`${styles.searchBox} ${loading ? styles.searching : ''}`}>
          <span className={styles.searchIcon}>
            {loading ? <span className={styles.spinner} /> : '⌕'}
          </span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={e => { setQuery(e.target.value); setShowHistory(true); }}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 150)}
            onKeyDown={handleKey}
            placeholder="Ask a study question..."
            disabled={loading}
            autoComplete="off"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => { setQuery(''); inputRef.current?.focus(); }}>✕</button>
          )}
          <button
            className={styles.askBtn}
            onClick={() => submit()}
            disabled={!query.trim() || loading}
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>

        {/* History dropdown */}
        {showHistory && history.length > 0 && (
          <div className={styles.dropdown}>
            <div className={styles.dropLabel}>Recent searches</div>
            {history.slice(0, 6).map((h, i) => (
              <button key={i} className={styles.dropItem} onMouseDown={() => { setQuery(h); submit(h); }}>
                <span className={styles.dropIcon}>↺</span> {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {!answer && !loading && (
        <div className={styles.suggestions}>
          <p className={styles.suggestLabel}>Try asking:</p>
          <div className={styles.chips}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className={styles.chip} style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => { setQuery(s); submit(s); }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={styles.error}>
          <span>⚠</span> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className={styles.skeleton}>
          {[1,2,3].map(i => (
            <div key={i} className={styles.skeletonLine} style={{ width: `${85 - i * 10}%`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}

      {/* Answer Card */}
      {answer && (
        <div className={styles.answerCard} ref={answerRef}>
          <div className={styles.answerHeader}>
            <div className={styles.answerQuestion}>
              <span className={styles.qIcon}>Q</span>
              <span>{query}</span>
            </div>
            <div className={styles.answerActions}>
              <button className={styles.actionBtn} onClick={handleCopy} title="Copy">
                {copied ? '✓ Copied' : '⎘ Copy'}
              </button>
              <button className={styles.actionBtn} onClick={handleSaveNote} title="Save as note">
                {saved ? '✓ Saved' : '⊕ Note'}
              </button>
              <button className={`${styles.actionBtn} ${styles.flashBtn}`} onClick={handleSaveFlashcard} title="Save as flashcard">
                ⊞ Flashcard
              </button>
            </div>
          </div>
          <div className={styles.answerBody}>
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
            </div>
          </div>

          {/* Related questions */}
          {related.length > 0 && (
            <div className={styles.related}>
              <p className={styles.relatedLabel}>Related questions</p>
              <div className={styles.relatedList}>
                {related.map((r, i) => (
                  <button key={i} className={styles.relatedBtn} onClick={() => { setQuery(r); submit(r); }}>
                    <span>→</span> {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
