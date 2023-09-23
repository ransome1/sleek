import React, { useState, useRef, useEffect } from 'react';
import { Drawer, Tabs, Tab, Box } from '@mui/material';
import Attributes from './DrawerAttributes';
import Sorting from './DrawerSorting';
import Filters from './DrawerFilters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH, faFilter, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import './Drawer.scss';

const store = window.electron.store;

const DrawerComponent = ({ isDrawerOpen, setIsDrawerOpen, attributes, filters, sorting, setSorting }) => {
  const [activeTab, setActiveTab] = useState('attributes');
  const [drawerWidth, setDrawerWidth] = useState(store.get('drawerWidth') || 500);
  const containerRef = useRef(null);
  const startXRef = useRef(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMouseDown = (e) => {
    startXRef.current = e.pageX;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const deltaX = startXRef.current - e.pageX;
    setDrawerWidth((prevWidth) => prevWidth - deltaX);
    startXRef.current = e.pageX;
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    store.set('drawerWidth', drawerWidth)
  }, [drawerWidth]);  

  return (
    <Drawer
      ref={containerRef}
      variant="persistent"
      anchor="left"
      open={isDrawerOpen}
      className={`Drawer ${isDrawerOpen ? 'open' : ''}`}
      style={{ width: drawerWidth, marginLeft: -drawerWidth }}
    >
      <Box
        className="drawerHandle"
        onMouseDown={handleMouseDown}
      />
      <Tabs className="tabs" centered value={activeTab} onChange={handleTabChange}>
        <Tab 
          tabIndex={0}
          label="Attributes"
          value="attributes" 
          icon={<FontAwesomeIcon icon={faFilter} />}
        />
        <Tab 
          tabIndex={0}
          label="Filters"
          value="filters"
          icon={<FontAwesomeIcon icon={faSlidersH} />}
        />
        <Tab 
          tabIndex={0}
          label="Sorting"
          value="sorting"
          icon={<FontAwesomeIcon icon={faArrowUpShortWide} />}
        />
      </Tabs>
      {activeTab === 'attributes' && (
        <Attributes
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          attributes={attributes}
          filters={filters}
          sorting={sorting}
        />
      )}
      {activeTab === 'filters' && (
        <Filters
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}
      {activeTab === 'sorting' && (
        <Sorting
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          sorting={sorting}
          setSorting={setSorting}
        />
      )}
    </Drawer>
  );
};

export default DrawerComponent;
