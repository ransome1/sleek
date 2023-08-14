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
                    
                    const isDate = dayjs(value).isValid();
                    const formattedValue = isDate ? dayjs(value).format('YYYY-MM-DD') : value;
                    const excluded = filters[key]?.some((filter) => filter.value === formattedValue && filter.exclude);
                    const selected = filters[key]?.some((filter) => filter.value === formattedValue);

                    return (
                      <div
                        key={`${key}-${childIndex}`}
                        data-todotxt-attribute={key}
                        data-todotxt-value={formattedValue}
                        className={`filter${isCtrlKeyPressed ? ' hide' : ''} ${selected ? 'selected' : ''} ${
                          excluded ? 'excluded' : ''
                        }`}
                      >
                        <Badge badgeContent={attributes[key][formattedValue]}>
                          <Button
                            className="attribute"
                            key={`${formattedValue}-${childIndex}`}
                            tabIndex={0}
                            onClick={() => handleFilterSelect(key, formattedValue, filters, isCtrlKeyPressed)}
                          >
                            {formattedValue}
                          </Button>
                        </Badge>
                        {(isCtrlKeyPressed || excluded) && (
                          <div
                            data-todotxt-attribute={key}
                            data-todotxt-value={formattedValue}
                            className="overlay"
                            onClick={() => handleFilterSelect(key, formattedValue, filters, isCtrlKeyPressed)}
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
