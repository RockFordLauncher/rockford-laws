import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { ArrowUp, Share2, Trash2, Bot } from 'lucide-react';
import data from './data.json';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import ContentArea from './components/ContentArea';
import AIAssistant from './components/AIAssistant';

function App() {
  const [activeDoc, setActiveDoc] = useState('uk'); // 'uk' or 'pk'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState('');
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large, xlarge
  const [toasts, setToasts] = useState([]);
  const [progress, setProgress] = useState(0);

  const scrollRef = useRef(null);

  // Load bookmarks on mount
  useEffect(() => {
    const saved = localStorage.getItem('rp-bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks', e);
      }
    }
  }, []);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem('rp-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = (e) => {
      const el = e.target;
      if (el.scrollHeight - el.clientHeight === 0) {
        setProgress(0);
        return;
      }
      const scrolled = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setProgress(scrolled);
    };
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [activeDoc, searchQuery]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleBookmark = (article) => {
    setBookmarks(prev => {
      const exists = prev.find(b => b.id === article.id);
      if (exists) {
        showToast('Удалено из избранного');
        return prev.filter(b => b.id !== article.id);
      } else {
        showToast('Добавлено в избранное');
        return [...prev, article];
      }
    });
  };

  const cycleFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge'];
    const idx = sizes.indexOf(fontSize);
    setFontSize(sizes[(idx + 1) % sizes.length]);
    showToast(`Размер шрифта изменен`);
  };

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChapterClick = (chapterId) => {
    const el = document.getElementById(chapterId);
    if (el && scrollRef.current) {
      // Scroll relative to the container
      const container = scrollRef.current;
      const topPos = el.offsetTop - 100;
      container.scrollTo({ top: topPos, behavior: 'smooth' });
    }
  };

  const handleNavigateToArticle = (docId, articleId) => {
    setActiveDoc(docId);
    // Give time for DOM to render the new document before scrolling
    setTimeout(() => {
      const el = document.getElementById(articleId);
      if (el && scrollRef.current) {
        const container = scrollRef.current;
        const topPos = el.offsetTop - 100;
        container.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }, 100);
  };

  // Generate data for bookmarks view
  let currentData;
  if (activeDoc === 'bookmarks') {
    const groupedBookmarks = {
      uk: { title: 'Уголовный кодекс', articles: [] },
      pk: { title: 'Процессуальный кодекс', articles: [] },
      const: { title: 'Конституция', articles: [] },
      ak: { title: 'Административный кодекс', articles: [] }
    };
    
    bookmarks.forEach(b => {
      if (b.id.startsWith('uk-')) groupedBookmarks.uk.articles.push(b);
      else if (b.id.startsWith('pk-')) groupedBookmarks.pk.articles.push(b);
      else if (b.id.startsWith('const-')) groupedBookmarks.const.articles.push(b);
      else if (b.id.startsWith('ak-')) groupedBookmarks.ak.articles.push(b);
    });

    const chapters = [];
    Object.entries(groupedBookmarks).forEach(([key, group], index) => {
      if (group.articles.length > 0) {
        chapters.push({
          id: `bm-${key}`,
          title: group.title,
          articles: group.articles
        });
      }
    });

    currentData = {
      title: 'Избранное',
      chapters: chapters
    };
  } else {
    currentData = data[activeDoc];
  }

  return (
    <div className={classNames('app-container', `font-${fontSize}`)}>
      <Sidebar 
        document={activeDoc}
        chapters={currentData.chapters}
        activeChapterId={activeChapterId}
        onChapterClick={handleChapterClick}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onChangeDoc={setActiveDoc}
      />

      <div className="main-area" style={{ marginLeft: isSidebarOpen ? 'var(--sidebar-width)' : 0 }}>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <TopNav 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          bookmarksCount={bookmarks.length}
          onCycleFontSize={cycleFontSize}
          document={activeDoc}
          onChangeDoc={setActiveDoc}
        />

        <ContentArea 
          documentTitle={currentData.title}
          chapters={currentData.chapters}
          searchQuery={searchQuery}
          bookmarks={bookmarks}
          toggleBookmark={toggleBookmark}
          showToast={showToast}
          onVisibleChapterChange={setActiveChapterId}
          scrollRef={scrollRef}
        />

        {/* FAB */}
        <div className="fab-container">
          <button className="fab ai-fab" onClick={() => setIsAIOpen(true)} title="ИИ Юрист" style={{ background: 'var(--accent-gradient)', color: 'white', border: 'none' }}>
            <Bot size={24} />
          </button>
          {progress > 10 && (
            <button className="fab" onClick={scrollToTop} title="Наверх">
              <ArrowUp size={24} />
            </button>
          )}
          {activeDoc === 'bookmarks' && bookmarks.length > 0 && (
            <button className="fab" onClick={() => { setBookmarks([]); showToast('Избранное очищено'); }} title="Очистить избранное" style={{ background: '#ef4444', color: 'white' }}>
              <Trash2 size={24} />
            </button>
          )}
        </div>
        
        <AIAssistant 
          isOpen={isAIOpen} 
          onClose={() => setIsAIOpen(false)} 
          onNavigate={handleNavigateToArticle} 
        />
      </div>

      {/* Toast container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
