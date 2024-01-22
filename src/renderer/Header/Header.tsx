import React, { useEffect, useCallback, RefObject, memo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import './Header.scss';

interface Props {
  settings: Settings;
  searchFieldRef: RefObject<HTMLInputElement>;
}

const { store } = window.api;

const HeaderComponent: React.FC<Props> = memo(({ 
  settings,
  searchFieldRef
}) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isSearchFocused = document.activeElement === searchFieldRef.current;
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key === 'f' && settings.isSearchOpen && !isSearchFocused) {
        event.preventDefault();
        searchFieldRef.current?.focus();
      }
    },
    [settings.isSearchOpen, searchFieldRef]
  );

  const handleOnClick = () => {
    store.setConfig('isSearchOpen', !settings.isSearchOpen);
  }

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [handleKeyDown]);

  return (settings.showFileTabs &&
    <div id='ToolBar' onClick={handleOnClick}>
      <SearchIcon 
        className={settings.isSearchOpen ? 'active' : ''}
        data-testid={"header-search-icon"}
      />
    </div>
  );
});

export default HeaderComponent;