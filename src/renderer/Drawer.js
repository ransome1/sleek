import React, { useEffect, useState } from 'react';
import { Box, Chip, Drawer, Accordion, AccordionSummary, AccordionDetails, Avatar } from '@mui/material';
import './Drawer.scss';

const DrawerComponent = ({ isOpen, drawerParameter }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({});

  const receiveFilters = (filters) => {
    setFilters(filters);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const receiveFiltersHandler = (filters) => {
      receiveFilters(filters);
    };

    window.electron.ipcRenderer.on('receiveFilters', receiveFiltersHandler);

    return () => {
      window.electron.ipcRenderer.removeListener('receiveFilters', receiveFiltersHandler);
    };
  }, []);

  return (
    <Drawer
      data-testid='drawer-component'
      variant='persistent'
      anchor='left'
      open={isOpen}
      className={`Drawer ${isOpen ? 'open' : ''}`}
      sx={{
        transition: isOpen ? 'margin-left 0.3s ease' : 'margin-left 0.3s ease',
      }}
    >
      {Object.keys(filters).length > 0 && (
        <Box className='Accordion'>
          {Object.keys(filters).map((key, index) => (
            <Accordion key={index} expanded onChange={handleChange(key)}>
              <AccordionSummary>{key}</AccordionSummary>
              <AccordionDetails>
                {Object.keys(filters[key]).map((childKey, childIndex) => (
                  <Chip key={childIndex} avatar={<Avatar>{filters[key][childKey]}</Avatar>} label={childKey} />
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Drawer>
  );
};

export default DrawerComponent;
