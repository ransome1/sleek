import React, { useState, useEffect } from 'react';
import { Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import './DrawerFilters.scss';

const store = window.electron.store;

const DrawerFilters = () => {
  const [showCompleted, setHideCompleted] = useState(store.get('showCompleted'));
  const [showHidden, setShowHidden] = useState(store.get('showHidden'));
  const [thresholdDateInTheFuture, setThresholdDateInTheFuture] = useState(store.get('thresholdDateInTheFuture'));
  const [dueDateInTheFuture, setDueDateInTheFuture] = useState(store.get('dueDateInTheFuture'));

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
    case 'thresholdDateInTheFuture':
      setThresholdDateInTheFuture(checked);
      break;
    case 'dueDateInTheFuture':
      setDueDateInTheFuture(checked);
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
          label="Completed todos"
        />
        <FormControlLabel
          control={<Switch checked={showHidden} onChange={handleSwitchChange} name="showHidden" />}
          label="Hidden todos"
        />
        <FormControlLabel
          control={<Switch checked={thresholdDateInTheFuture} onChange={handleSwitchChange} name="thresholdDateInTheFuture" />}
          label="Threshold date set in the future"
        />
        <FormControlLabel
          control={<Switch checked={dueDateInTheFuture} onChange={handleSwitchChange} name="dueDateInTheFuture" />}
          label="Due date set in the future"
        />
      </FormGroup>
    </Box>
  );
};

export default DrawerFilters;
