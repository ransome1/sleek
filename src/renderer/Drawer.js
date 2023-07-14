import React, { useState, useEffect } from 'react';
import { Box, Chip, Drawer, Accordion, AccordionSummary, AccordionDetails, Avatar, Button, Badge } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Drawer.scss';

const ipcRenderer = window.electron.ipcRenderer;

const attributeMapping = {
  t: "Threshold date",
  due: "Due date",
  projects: "Projects",
  contexts: "Contexts",
  priority: "Priority",
  rec: "Recurrence",
  pm: "Pomodoro timer",
  tag: "Tags",
}

const DrawerComponent = ({ isOpen, attributes }) => {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);

  const handleChipClick = (key, childKey) => {
    setSelectedFilters((prevSelectedFilters) => {
      const updatedFilters = { ...prevSelectedFilters };
      if (updatedFilters[key]) {
        const filters = updatedFilters[key];
        const filterIndex = filters.findIndex((filter) => filter.value === childKey);
        if (filterIndex !== -1) {
          filters.splice(filterIndex, 1);
        } else {
          filters.push({ value: childKey, exclude: isCtrlKeyPressed });
        }
      } else {
        updatedFilters[key] = [{ value: childKey, exclude: isCtrlKeyPressed }];
      }
      ipcRenderer.send('selectedFilters', updatedFilters);
      return updatedFilters;
    });
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey || event.metaKey) {
      setIsCtrlKeyPressed(true);
    }
  };

  const handleKeyUp = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      setIsCtrlKeyPressed(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <Drawer
      data-testid='drawer-component'
      variant='persistent'
      anchor='left'
      open={isOpen}
      className={`Drawer ${isOpen ? 'open' : ''}`}
      sx={{ transition: isOpen ? 'margin-left 0.3s ease' : 'margin-left 0.3s ease' }}
    >
      {Object.keys(attributes).length > 0 && (
        <Box className='Accordion'>
          {Object.keys(attributes).map((key, index) => {
            if (Object.keys(attributes[key]).length > 0) {
              return (
                <Accordion key={index} expanded>
                  <AccordionSummary><h3>{attributeMapping[key]}</h3></AccordionSummary>
                  <AccordionDetails>
                    {Object.keys(attributes[key]).map((childKey, childIndex) => {
                      const excluded = selectedFilters[key]?.some((filter) => filter.value === childKey && filter.exclude);
                      const selected = selectedFilters[key]?.some((filter) => filter.value === childKey);

                      return (
                        <div key={`${key}-${childIndex}`} data-todotxt-attribute={key} className={`chipWrapper ${isCtrlKeyPressed ? 'hide' : ''} ${selected ? 'selected' : ''} ${excluded ? 'excluded' : ''}`}>
                          
                          <Badge badgeContent={attributes[key][childKey]}>
                            <Button
                              key={`${childKey}-${childIndex}`}
                              onClick={() => handleChipClick(key, childKey)}
                            >{childKey}</Button>
                          </Badge>
                          {(isCtrlKeyPressed || excluded) && (
                            <div data-todotxt-attribute={key} className="overlay" onClick={() => handleChipClick(key, childKey)}>
                              <FontAwesomeIcon icon={faEyeSlash} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            }
            return null;
          })}
        </Box>
      )}
    </Drawer>
  );
};

export default DrawerComponent;
