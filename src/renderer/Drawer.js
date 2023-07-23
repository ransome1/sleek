import React, { useState, useEffect, useRef } from 'react';
import { Box, Drawer, Accordion, AccordionSummary, AccordionDetails, Avatar, Button, Badge } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { handleFilterSelect } from './Shared';
import './Drawer.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

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

const DrawerComponent = ({ isDrawerOpen, setIsDrawerOpen, drawerParameter, attributes, filters }) => {
  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
  const firstTabbableElementRef = useRef(null);

  const handleCtrlCmdDown = (event) => {
    if (event.ctrlKey || event.metaKey) {
      setIsCtrlKeyPressed(true);
    }
  };

  const handleCtrlCmdUp = (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      setIsCtrlKeyPressed(false);
    }
  };  

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleCtrlCmdDown);
      document.addEventListener('keyup', handleCtrlCmdUp);      
      document.addEventListener('keydown', handleKeyDown);

      if (firstTabbableElementRef.current) {
        firstTabbableElementRef.current.focus();
      }      

    } else {
      document.removeEventListener('keydown', handleCtrlCmdDown);
      document.removeEventListener('keyup', handleCtrlCmdUp);      
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleCtrlCmdDown);
      document.removeEventListener('keyup', handleCtrlCmdUp);      
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen]);

  return (
    <Drawer
      data-testid="drawer-component"
      variant="persistent"
      anchor="left"
      open={isDrawerOpen}
      className={`Drawer ${isDrawerOpen ? 'open' : ''}`}
    >
      {Object.keys(attributes).length > 0 && (
        <Box className="Accordion" ref={firstTabbableElementRef}>
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
                          data-todotxt-value={value}
                          className={`filter${isCtrlKeyPressed ? ' hide' : ''} ${selected ? 'selected' : ''} ${
                            excluded ? 'excluded' : ''
                          }`}
                        >
                          <Badge badgeContent={attributes[key][value]}>
                            <Button key={`${value}-${childIndex}`} tabIndex={0} onClick={() => handleFilterSelect(key, value, filters, isCtrlKeyPressed)}>
                              {value}
                            </Button>
                          </Badge>
                          {(isCtrlKeyPressed || excluded) && (
                            <div
                              data-todotxt-attribute={key}
                              data-todotxt-value={value}
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
