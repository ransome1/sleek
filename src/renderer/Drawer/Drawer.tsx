import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Drawer, Tabs, Tab, Box } from '@mui/material';
import Attributes from './Attributes';
import Sorting from './Sorting/Sorting';
import Filters from './Filters';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import { withTranslation } from 'react-i18next';
import { i18n } from '../LanguageSelector';
import DraggableList from '../DraggableList';
import './Drawer.scss';

const { store } = window.api;

interface DrawerComponent {
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  attributes: { [key: string]: { [key: string]: number } };
  filters: { [key: string]: { value: string; exclude: boolean }[] };
  sorting: any;
  attributeMapping: object;
}

const DrawerComponent: React.FC<DrawerComponent> = ({
  isDrawerOpen,
  setIsDrawerOpen,
  attributes,
  filters,
  sorting,
  attributeMapping,
  t
}: DrawerComponentProps) => {
  const [activeTab, setActiveTab] = useState<string>('attributes');
  const [drawerWidth, setDrawerWidth] = useState<number>(store.get('drawerWidth') || 500);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef<number>(0);

  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startXRef.current = e.pageX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = startXRef.current - e.pageX;
    setDrawerWidth((prevWidth) => prevWidth - deltaX);
    startXRef.current = e.pageX;
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    store.set('drawerWidth', drawerWidth);
  }, [drawerWidth]);

  return (
    <Drawer
      ref={containerRef}
      variant="persistent"
      open={isDrawerOpen}
      className={`Drawer ${isDrawerOpen ? 'open' : ''}`}
      style={{ width: drawerWidth, marginLeft: -drawerWidth }}
    >
      <Box className="drawerHandle" onMouseDown={handleMouseDown} />
      <Tabs className="tabs" centered value={activeTab} onChange={handleTabChange}>
        <Tab tabIndex={0} label={t('drawer.tabs.attributes')} value="attributes" icon={<FilterAltIcon />} />
        <Tab tabIndex={0} label={t('drawer.tabs.filters')} value="filters" icon={<TuneIcon />} />
        <Tab tabIndex={0} label={t('drawer.tabs.sorting')} value="sorting" icon={<FilterListIcon />} />
      </Tabs>
      {isDrawerOpen && activeTab === 'attributes' && (
        <Attributes
          isDrawerOpen={isDrawerOpen}
          attributes={attributes}
          filters={filters}
          attributeMapping={attributeMapping}
        />
      )}
      {isDrawerOpen && activeTab === 'filters' && <Filters />}
      {isDrawerOpen && activeTab === 'sorting' && (
        <Sorting attributeMapping={attributeMapping} />
      )}
    </Drawer>
  );
};

export default withTranslation()(DrawerComponent);