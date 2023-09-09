import React, { useState, useEffect, useRef } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Box, Button, Badge } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash, faMeteor } from '@fortawesome/free-solid-svg-icons';
import { handleFilterSelect, attributeMapping } from './Shared';
import './DrawerAttributes.scss';

const store = window.electron.store;

const Attributes = ({ isDrawerOpen, setIsDrawerOpen, attributes, filters }) => {

  const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
  const [accordionOpenState, setAccordionOpenState] = useState(store.get('accordionOpenState') || null);
  const firstTabbableElementRef = useRef(null);

  const isAttributesEmpty = (attributes) => {
    return Object.values(attributes).every(attribute => !Object.keys(attribute).length);
  }  

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

  const handleAccordionToggle = (index) => {
    setAccordionOpenState((prevState) =>
      prevState.map((prevState, prevIndex) =>
        prevIndex === index ? !prevState : prevState
      )
    );
  };

  useEffect(() => {
    const handleFocusFirstTabbableElement = () => {
      if (firstTabbableElementRef.current) {
        firstTabbableElementRef.current.focus();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('keydown', handleCtrlCmdDown);
      document.addEventListener('keyup', handleCtrlCmdUp);
      document.addEventListener('keydown', handleKeyDown);
      handleFocusFirstTabbableElement();
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

  useEffect(() => {
    store.set('accordionOpenState', accordionOpenState)
  }, [accordionOpenState]); 

  return (
    <Box className="Attributes" ref={firstTabbableElementRef}>
      {isAttributesEmpty(attributes) ? (
        <div className="placeholder">
          <FontAwesomeIcon icon={faMeteor} /><br />
          No attributes available yet
        </div>
      ) : (
        Object.keys(attributes).map((key, index) =>
          Object.keys(attributes[key]).length > 0 ? (
            <Accordion
              TransitionProps={{ unmountOnExit: true }}
              key={index}
              expanded={accordionOpenState[index]}
              onChange={() => handleAccordionToggle(index)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h3>{attributeMapping[key]}</h3>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {Object.keys(attributes[key]).map((value, childIndex) => {
                    const excluded = filters[key]?.some(
                      (filter) => filter.value === value && filter.exclude
                    );
                    const selected = filters[key]?.some((filter) => filter.value === value);
                    const disabled = attributes[key][value] === 0;

                    return (
                      <div
                        key={`${key}-${value}-${childIndex}`}
                        data-todotxt-attribute={key}
                        data-todotxt-value={value}
                        className={`filter${isCtrlKeyPressed ? ' hide' : ''} ${
                          selected ? 'selected' : ''
                        } ${excluded ? 'excluded' : ''}`}
                      >
                        <Badge badgeContent={attributes[key][value]}>
                          <Button
                            className="attribute"
                            onClick={
                              disabled
                                ? null
                                : () => handleFilterSelect(key, value, filters, isCtrlKeyPressed)
                            }
                            disabled={disabled}
                          >
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
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : null
        )
      )}
    </Box>
  );
};

export default Attributes;
