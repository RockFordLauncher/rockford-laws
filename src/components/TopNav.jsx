import React, { useEffect, useRef } from 'react';
import { Search, Menu, Bookmark, Type, Command } from 'lucide-react';
import classNames from 'classnames';

export default function TopNav({ 
  searchQuery, 
  setSearchQuery, 
  onToggleSidebar, 
  isSidebarOpen,
  onToggleBookmarks,
  bookmarksCount,
  onCycleFontSize,
  document,
  onChangeDoc
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        {!isSidebarOpen && (
          <button className="btn-icon" onClick={onToggleSidebar} title="Открыть меню">
            <Menu size={20} />
          </button>
        )}
        <div style={{ display: 'flex', gap: '8px', marginLeft: isSidebarOpen ? '0' : '10px' }}>
          <button 
            className={classNames('btn', { 'active': document === 'uk' })} 
            onClick={() => onChangeDoc('uk')}
          >
            УК
          </button>
          <button 
            className={classNames('btn', { 'active': document === 'pk' })} 
            onClick={() => onChangeDoc('pk')}
          >
            ПК
          </button>
          <button 
            className={classNames('btn', { 'active': document === 'const' })} 
            onClick={() => onChangeDoc('const')}
          >
            Конституция
          </button>
          <button 
            className={classNames('btn', { 'active': document === 'ak' })} 
            onClick={() => onChangeDoc('ak')}
          >
            АК
          </button>
          <button 
            className={classNames('btn', { 'active': document === 'bookmarks' })} 
            onClick={() => onChangeDoc('bookmarks')}
          >
            Избранное
            {bookmarksCount > 0 && (
              <span style={{
                background: document === 'bookmarks' ? 'rgba(255,255,255,0.2)' : 'var(--accent-purple)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                padding: '2px 6px',
                marginLeft: '6px'
              }}>
                {bookmarksCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="topbar-center">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            ref={searchInputRef}
            type="text" 
            className="search-input" 
            placeholder="Поиск по статьям и главам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="shortcut-hint">
            <Command size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }}/>
            K
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="btn-icon" onClick={onCycleFontSize} title="Изменить размер шрифта">
          <Type size={18} />
        </button>
      </div>
    </div>
  );
}
