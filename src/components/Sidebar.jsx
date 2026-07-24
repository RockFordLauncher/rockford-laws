import React from 'react';
import { Book, ChevronRight, X, ScrollText } from 'lucide-react';
import classNames from 'classnames';

export default function Sidebar({ 
  document, 
  chapters, 
  activeChapterId, 
  onChapterClick, 
  isOpen, 
  onClose,
  onChangeDoc
}) {
  return (
    <div className={classNames('sidebar', { 'collapsed': !isOpen })}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <Book size={20} className="text-gradient" />
          <span>Навигация</span>
        </div>
        <button className="btn-icon" onClick={onClose} title="Закрыть (Focus Mode)">
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-nav">
        {chapters.map((chapter) => (
          <div 
            key={chapter.id} 
            className={classNames('nav-item', { 'active': activeChapterId === chapter.id })}
            onClick={() => onChapterClick(chapter.id)}
          >
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {chapter.title}
            </span>
            <ChevronRight size={14} style={{ opacity: activeChapterId === chapter.id ? 1 : 0.3 }} />
          </div>
        ))}
      </div>
      
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ScrollText size={14} />
          Rockford RP • 2026
        </div>
      </div>
    </div>
  );
}
