import React, { useState, useEffect } from 'react';
import { Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import './DrawerFilters.scss';

const store = window.electron.store;

const DrawerFilters = () => {
  const [showCompleted, setHideCompleted] = useState(store.get('showCompleted'));
  const [showHidden, setShowHidden] = useState(store.get('showHidden'));

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    store.set(name, checked);
    switch (name) {
		case 'showCompleted':
			setHideCompleted(checked);
			break;
		case 'showHidden':
			setShowHidden(checked);
			break;
		default:
			break;
    }
  };

  return (
    <Box className="Filters">
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={showCompleted} onChange={handleSwitchChange} name="showCompleted" />}
          label="Show completed todos"
        />
        <FormControlLabel
          control={<Switch checked={showHidden} onChange={handleSwitchChange} name="showHidden" />}
          label="Show hidden todos"
        />

      </FormGroup>
    </Box>
  );
};

export default DrawerFilters;
