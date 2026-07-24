import React, { useEffect, useRef, useState } from 'react';
import { Bookmark, Copy, Link as LinkIcon, ChevronDown, ChevronRight, Share2 } from 'lucide-react';
import classNames from 'classnames';

// Highlighter function for search matches
const highlightText = (text, query) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? <mark key={i}>{part}</mark> : part
      )}
    </>
  );
};

const ArticleCard = ({ article, query, isBookmarked, toggleBookmark, showToast }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(`${article.title}\n${article.text.join('\n')}`);
    showToast('Статья скопирована в буфер обмена');
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.hash = article.id;
    navigator.clipboard.writeText(url.toString());
    showToast('Ссылка на статью скопирована');
  };

  return (
    <div className={classNames('article-card', { 'highlighted': window.location.hash === `#${article.id}` })} id={article.id}>
      <div className="article-header">
        <h3 className="article-title">{highlightText(article.title, query)}</h3>
        <div className="article-actions">
          <button className="btn-icon" onClick={handleCopyLink} title="Копировать ссылку">
            <LinkIcon size={16} />
          </button>
          <button className="btn-icon" onClick={handleCopy} title="Копировать текст">
            <Copy size={16} />
          </button>
          <button 
            className="btn-icon" 
            onClick={() => toggleBookmark(article)} 
            title={isBookmarked ? "Убрать из избранного" : "В избранное"}
            style={{ color: isBookmarked ? 'var(--accent-purple)' : undefined }}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      <div className="article-content">
        {article.text.map((paragraph, idx) => (
          <div key={idx} className="article-text">
            {highlightText(paragraph, query)}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChapterSection = ({ chapter, query, bookmarks, toggleBookmark, showToast }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If there's a search query and this chapter has matches, we should probably keep it open
  useEffect(() => {
    if (query) setIsCollapsed(false);
  }, [query]);

  return (
    <div className="chapter-section" id={chapter.id}>
      <h2 className="chapter-title" onClick={() => setIsCollapsed(!isCollapsed)}>
        {highlightText(chapter.title, query)}
        {isCollapsed ? <ChevronRight size={24} /> : <ChevronDown size={24} />}
      </h2>
      
      {!isCollapsed && (
        <div className="chapter-articles">
          {chapter.articles.map((article) => {
            const isMatch = !query || 
              article.title.toLowerCase().includes(query.toLowerCase()) || 
              article.text.some(t => t.toLowerCase().includes(query.toLowerCase()));
              
            if (!isMatch) return null;

            return (
              <ArticleCard 
                key={article.id}
                article={article}
                query={query}
                isBookmarked={bookmarks.some(b => b.id === article.id)}
                toggleBookmark={toggleBookmark}
                showToast={showToast}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function ContentArea({ 
  documentTitle,
  chapters, 
  searchQuery, 
  bookmarks, 
  toggleBookmark, 
  showToast,
  onVisibleChapterChange,
  scrollRef
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(e => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Find the one closest to top
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          onVisibleChapterChange(visibleEntries[0].target.id);
        }
      },
      { root: containerRef.current, rootMargin: '-100px 0px -80% 0px' }
    );

    const chapterElements = document.querySelectorAll('.chapter-section');
    chapterElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [chapters, searchQuery]); // Re-run when chapters change

  // Sync ref
  useEffect(() => {
    if (scrollRef) scrollRef.current = containerRef.current;
  }, [scrollRef]);

  return (
    <div className="content-wrapper" ref={containerRef}>
      <h1 className="document-title">
        <span className="text-gradient">{documentTitle}</span>
      </h1>
      
      {chapters.length === 0 && (
        <div className="empty-state">
          <h2>Ничего не найдено</h2>
          <p>Попробуйте изменить поисковой запрос.</p>
        </div>
      )}

      {chapters.map((chapter) => {
        // Filter chapter if query exists
        const hasMatch = !searchQuery || 
          chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chapter.articles.some(a => 
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.text.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          
        if (!hasMatch) return null;

        return (
          <ChapterSection 
            key={chapter.id}
            chapter={chapter}
            query={searchQuery}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            showToast={showToast}
          />
        );
      })}
    </div>
  );
}
