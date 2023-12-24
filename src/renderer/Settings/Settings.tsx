import React, { useState, memo } from 'react';
import { Box, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, Switch, Slider } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import { handleSettingChange } from '../Shared';
import './Settings.scss';

const { store } = window.api;

interface Props extends WithTranslation {
  isOpen: boolean;
  onClose: () => void;
  setAttributeMapping: React.Dispatch<React.SetStateAction<Attribute>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  selectedLanguage: string;
  setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
  t: typeof i18n.t;
}

const Settings: React.FC<Props> = memo(({
  isOpen,
  onClose,
  setAttributeMapping,
  zoom,
  setZoom,
  selectedLanguage,
  setSelectedLanguage,
  t,
}) => {
  const [settings, setSettings] = useState({
    appendCreationDate: store.get('appendCreationDate'),
    convertRelativeToAbsoluteDates: store.get('convertRelativeToAbsoluteDates'),
    tray: store.get('tray'),
    showFileTabs: store.get('showFileTabs'),
    colorTheme: store.get('colorTheme'),
    bulkTodoCreation: store.get('bulkTodoCreation'),
    matomo: store.get('matomo'),
    notificationsAllowed: store.get('notificationsAllowed'),
    notificationThreshold: store.get('notificationThreshold'),
  });

  const handleColorThemeChange = (event: Event) => {
    const selectedValue = event.target?.value;
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
          (settingName !== 'colorTheme' && settingName !== 'notificationThreshold') && (
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
            {t('settings.notificationThreshold')}
            <Slider
              id="notificationThreshold"
              value={settings.notificationThreshold}
              step={1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} days`}
              min={1}
              max={10}
              onChange={handleSettingChange('notificationThreshold', setSettings)}
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
            valueLabelFormat={(value) => `${value}%`}
            min={75} max={125}
            onChange={(event) => setZoom(event.target?.value)}
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
        <LanguageSelector
          setAttributeMapping={setAttributeMapping}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          />
      </Box>
    </Modal>
  );
});

export default withTranslation()(Settings);
