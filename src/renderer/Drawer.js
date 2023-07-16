import React, { useState, useEffect } from 'react';
import { Box, Chip, Drawer, Accordion, AccordionSummary, AccordionDetails, Avatar, Button, Badge } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { handleFilterSelect } from './Shared';
import './Drawer.scss';

const ipcRenderer = window.electron.ipcRenderer;

const attributeMapping = {
  t: 'Threshold date',
  due: 'Due date',
  projects: 'Projects',
  contexts: 'Contexts',
  priority: 'Priority',
  rec: 'Recurrence',
  pm: 'Pomodoro timer',
  //tags: 'Tags',
};

const DrawerComponent = ({ isDrawerOpen, attributes, filters }) => {
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);

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
      data-testid="drawer-component"
      variant="persistent"
      anchor="left"
      open={isDrawerOpen}
      className={`Drawer ${isDrawerOpen ? 'open' : ''}`}
      sx={{ transition: isDrawerOpen ? 'margin-left 0.3s ease' : 'margin-left 0.3s ease' }}
    >
      {Object.keys(attributes).length > 0 && (
        <Box className="Accordion">
          {Object.keys(attributes).map((key, index) => {
            if (Object.keys(attributes[key]).length > 0) {
              return (
                <Accordion key={index} expanded>
                  <AccordionSummary>
                    <h3>{attributeMapping[key]}</h3>
                  </AccordionSummary>
                  <AccordionDetails>
                    {Object.keys(attributes[key]).map((value, childIndex) => {

                      const excluded = filters[key]?.some((filter) => filter.value === value && filter.exclude);
                      const selected = filters[key]?.some((filter) => filter.value === value);

                      return (
                        <div
                          key={`${key}-${childIndex}`}
                          data-todotxt-attribute={key}
                          className={`chipWrapper ${isCtrlKeyPressed ? 'hide' : ''} ${selected ? 'selected' : ''} ${
                            excluded ? 'excluded' : ''
                          }`}
                        >
                          <Badge badgeContent={attributes[key][value]}>
                            <Button key={`${value}-${childIndex}`} onClick={() => handleFilterSelect(key, value, filters, isCtrlKeyPressed)}>
                              {value}
                            </Button>
                          </Badge>
                          {(isCtrlKeyPressed || excluded) && (
                            <div
                              data-todotxt-attribute={key}
                              className="overlay"
                              onClick={() => handleFilterSelect(key, value, filters, isCtrlKeyPressed)}
                            >
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
