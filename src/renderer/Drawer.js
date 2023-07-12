import React, { useEffect, useState } from 'react';
import { Box, Chip, Drawer, Accordion, AccordionSummary, AccordionDetails, Avatar } from '@mui/material';
import './Drawer.scss';

const DrawerComponent = ({ isOpen, drawerParameter, filters }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Drawer
      data-testid='drawer-component'
      variant='persistent'
      anchor='left'
      open={isOpen}
      className={`Drawer ${isOpen ? 'open' : ''}`}
      sx={{ transition: isOpen ? 'margin-left 0.3s ease' : 'margin-left 0.3s ease' }}
    >
      {Object.keys(filters).length > 0 && (
        <Box className='Accordion'>
          {Object.keys(filters).map((key, index) => {
            if (Object.keys(filters[key]).length > 0) {
              return (
                <Accordion key={index} expanded onChange={handleChange(key)}>
                  <AccordionSummary><h3>{key}</h3></AccordionSummary>
                  <AccordionDetails>
                    {Object.keys(filters[key]).map((childKey, childIndex) => (
                      <Chip
                        key={childIndex}
                        avatar={<Avatar>{filters[key][childKey]}</Avatar>}
                        label={childKey}
                        data-todotxt-attribute={key}
                      />
                    ))}
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
