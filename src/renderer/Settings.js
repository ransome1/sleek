import React, { useState } from 'react';
import { Box, FormGroup, FormControlLabel, Switch, Divider, Modal } from '@mui/material';
import './Settings.scss';

const store = window.electron.store;

const Settings = ({ isOpen, onClose }) => {
  const [appendCreationDate, setAppendCreationDate] = useState(store.get('appendCreationDate'));
  const [allowAllFileExtensions, setAllowAllFileExtensions] = useState(store.get('allowAllFileExtensions'));
  const [convertRelativeToAbsoluteDates, setConvertRelativeToAbsoluteDates] = useState(store.get('convertRelativeToAbsoluteDates'));

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    store.set(name, checked);
    switch (name) {
      case 'appendCreationDate':
        setAppendCreationDate(checked);
        break;
      case 'allowAllFileExtensions':
        setAllowAllFileExtensions(checked);
        break;
      case 'convertRelativeToAbsoluteDates':
        setConvertRelativeToAbsoluteDates(checked);
        break;
      default:
        break;
    }
  };  

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="settings-modal-title"
    >
      <Box
      	className="Modal"
      >
        <h3>Settings</h3>
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={appendCreationDate} onChange={handleSwitchChange} name="appendCreationDate" />}
            label="Append creation date when todo is created"
          />
          <FormControlLabel
            control={<Switch checked={allowAllFileExtensions} onChange={handleSwitchChange} name="allowAllFileExtensions" />}
            label="Allow sleek to open all file extensions"
          />
          <FormControlLabel
            control={<Switch checked={convertRelativeToAbsoluteDates} onChange={handleSwitchChange} name="convertRelativeToAbsoluteDates" />}
            label="Convert relative dates to absolute dates"
          />
        </FormGroup>
      </Box>
    </Modal>
  );
};

export default Settings;
