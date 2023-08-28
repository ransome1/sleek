import React, { useState, useEffect, useRef } from 'react';
import { Box, Drawer, Button, Badge } from '@mui/material';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { handleFilterSelect, attributeMapping } from './Shared';
import './DrawerAttributes.scss';

const Attributes = ({ isDrawerOpen, setIsDrawerOpen, attributes, filters }) => {
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

  return (
    <>
      {Object.keys(attributes).length > 0 && (
        <Box className="Attributes" ref={firstTabbableElementRef}>
          {Object.keys(attributes).map((key, index) => {
            if (Object.keys(attributes[key]).length > 0) {
              return (
                <React.Fragment key={index}>
                  <h3>{attributeMapping[key]}</h3>
                  <Box>
                  {Object.keys(attributes[key]).map((value, childIndex) => {                  
                    const excluded = filters[key]?.some((filter) => filter.value === value && filter.exclude);
                    const selected = filters[key]?.some((filter) => filter.value === value);
                    const disabled = (attributes[key][value] === 0) ? true : false;

                    return (
                      <div
                        key={`${key}-${childIndex}`}
                        data-todotxt-attribute={key}
                        data-todotxt-value={value}
                        className={`filter${isCtrlKeyPressed ? ' hide' : ''} ${selected ? 'selected' : ''} ${
                          excluded ? 'excluded' : ''}`}
                      >
                        <Badge badgeContent={attributes[key][value]}>
                          <Button
                            className="attribute"
                            key={`${value}-${childIndex}`}
                            tabIndex={0}
                            onClick={disabled ? null : () => handleFilterSelect(key, value, filters, isCtrlKeyPressed)}
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
                </React.Fragment>
              );
            }
            return null;
          })}
        </Box>
      )}
    </>
  );
};

export default Attributes;
