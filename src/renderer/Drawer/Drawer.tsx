import React, { useState, useRef, useEffect, memo } from 'react';
import Drawer from '@mui/material/Drawer';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import DrawerAttributes from './Attributes';
import DrawerSorting from './Sorting/Sorting';
import DrawerFilters from './Filters';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './Drawer.scss';

const { store } = window.api;

interface Props extends WithTranslation {
  settings: Settings;
  attributes: Attributes | null;
  filters: Filters | null;
  searchFieldRef: React.RefObject<HTMLInputElement>;
  t: typeof i18n.t;
}

const DrawerComponent: React.FC<Props> = memo(({
  settings,
  attributes,
  filters,
  searchFieldRef,
  t
}) => {
  const [activeTab, setActiveTab] = useState<string>('attributes');
  const [drawerWidth, setDrawerWidth] = useState<number>(store.getConfig('drawerWidth') || 500);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    startXRef.current = event.pageX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    startXRef.current = event.pageX;
    setDrawerWidth((event.pageX - 80 >= 165) ? event.pageX - 80 : 165);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const isSearchFocused = document.activeElement === searchFieldRef.current;
    if(!isSearchFocused && event.key === 'Escape') {
      store.setConfig('isDrawerOpen', false);
    }
  };  

  useEffect(() => {
    store.setConfig('drawerWidth', drawerWidth);
  }, [drawerWidth]);

  useEffect(() => {
    document.addEventListener('keydown', (event) => handleKeyDown(event));
    return () => {
      document.removeEventListener('keydown', (event) => handleKeyDown(event));
    };
  }, []);

  return (
    <Drawer
      id="drawer"
      ref={containerRef}
      variant="persistent"
      open={settings.isDrawerOpen}
      className={`${settings.isDrawerOpen ? 'open' : ''}`}
      style={{ width: drawerWidth, marginLeft: -drawerWidth }}
    >
      <div className="drawerHandle" onMouseDown={handleMouseDown} />
      <Tabs className="tabs" centered value={activeTab} onChange={handleTabChange}>
        <Tab tabIndex={0} label={t('drawer.tabs.attributes')} value="attributes" icon={<FilterAltIcon />} data-testid={'drawer-tab-attributes'} />
        <Tab tabIndex={0} label={t('drawer.tabs.filters')} value="filters" icon={<TuneIcon />} data-testid={'drawer-tab-filters'} />
        <Tab tabIndex={0} label={t('drawer.tabs.sorting')} value="sorting" icon={<FilterListIcon />} data-testid={'drawer-tab-sorting'} />
      </Tabs>
      {settings.isDrawerOpen && activeTab === 'attributes' && (
        <DrawerAttributes
          settings={settings}
          attributes={attributes}
          filters={filters}
        />
      )}
      {settings.isDrawerOpen && activeTab === 'filters' && <DrawerFilters settings={settings} />}
      {settings.isDrawerOpen && activeTab === 'sorting' && (
        <DrawerSorting settings={settings} />
      )}
    </Drawer>
  );
});

export default withTranslation()(DrawerComponent);
