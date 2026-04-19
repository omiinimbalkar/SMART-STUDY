import React, { useState } from 'react';
import SearchPage from './pages/SearchPage.jsx';
import FlashcardsPage from './pages/FlashcardsPage.jsx';
import NotesPage from './pages/NotesPage.jsx';
import styles from './App.module.css';

const NAV = [
  { id: 'search', label: '✦ Ask AI', icon: '🔍' },
  { id: 'flashcards', label: 'Flashcards', icon: '🗂' },
  { id: 'notes', label: 'Notes', icon: '📝' },
];

export default function App() {
  const [page, setPage] = useState('search');

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.brandIcon}>⬡</span>
          <span className={styles.brandName}>StudyAI</span>
        </div>
        <div className={styles.navLinks}>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`${styles.navBtn} ${page === n.id ? styles.active : ''}`}
              onClick={() => setPage(n.id)}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
        <button className={styles.loginBtn}>Sign In</button>
      </nav>

      <main className={styles.main}>
        {page === 'search' && <SearchPage onNavigate={setPage} />}
        {page === 'flashcards' && <FlashcardsPage />}
        {page === 'notes' && <NotesPage />}
      </main>
    </div>
  );
}
