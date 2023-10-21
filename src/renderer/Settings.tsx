import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Switch,
  Slider,
  Typography
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import { handleSettingChange } from './Shared';
import './Settings.scss';

const { store } = window.api;

interface Settings extends WithTranslation {
  isOpen: boolean;
  onClose: () => void;
  zoom: number;
  setZoom: function;
}

const Settings: React.FC<Settings> = ({
  isOpen,
  onClose,
  setAttributeMapping,
  zoom,
  setZoom,
  t,
}) => {
  const [settings, setSettings] = useState({
    appendCreationDate: store.get('appendCreationDate'),
    convertRelativeToAbsoluteDates: store.get('convertRelativeToAbsoluteDates'),
    tray: store.get('tray'),
    showFileTabs: store.get('showFileTabs'),
    colorTheme: store.get('colorTheme'),
    notificationsAllowed: store.get('notificationsAllowed'),
    notificationThresholdDueDates: store.get('notificationThresholdDueDates'),
  });

  const handleColorThemeChange = (event) => {
    const selectedValue = event.target.value;
    if(selectedValue) {
      store.set('colorTheme', selectedValue);
      setSettings((prevSettings) => ({
        ...prevSettings,
        colorTheme: selectedValue,
      }));
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby='settings-modal-title'>
      <Box className='Modal' bgcolor='background.paper'>
        <h3>{t('settings.headline')}</h3>
        {Object.entries(settings).map(([settingName, settingValue]) => (
          (settingName !== 'colorTheme' && settingName !== 'notificationThresholdDueDates') && (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  checked={settingValue}
                  onChange={handleSettingChange(settingName as keyof typeof settings, setSettings)}
                  name={settingName}
                />
              }
              label={t(`settings.${settingName}`)}
            />
          )
        ))}

        {settings.notificationsAllowed && (
          <FormControl sx={{ width: 300, clear: 'both' }}>
            {t('settings.notificationThresholdDueDates')}
            <Slider
              id="notificationThresholdDueDates"
              value={settings.notificationThresholdDueDates}
              step={1}
              valueLabelDisplay="auto"
              min={1}
              max={10}
              onChange={handleSettingChange('notificationThresholdDueDates', setSettings)}
            />
          </FormControl>
        )}     

        <FormControl sx={{ width: 300, clear: 'both', }}>
          Zoom
          <Slider
            id="zoomSlider"
            value={zoom}
            step={5}
            valueLabelDisplay="auto"
            min={75} max={125}
            onChange={(event) => setZoom(event.target.value)}
          />
        </FormControl>

        <FormControl>
          <InputLabel>{t('settings.colorTheme')}</InputLabel>
          <Select
            className='colorTheme'
            label={t('settings.colorTheme')}
            value={settings.colorTheme}
            onChange={handleColorThemeChange}
          >
            {['system', 'light', 'dark'].map((theme) => (
              <MenuItem key={theme} value={theme}>
                {t(`settings.${theme}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LanguageSelector setAttributeMapping={setAttributeMapping} />
      </Box>
    </Modal>
  );
};

export default withTranslation()(Settings);
