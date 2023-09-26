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
} from '@mui/material';
import { withTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import { handleSettingChange } from './Shared';
import './Settings.scss';

const store = window.api.store;

interface Settings extends WithTranslation {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<Settings> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [settings, setSettings] = useState({
    appendCreationDate: store.get('appendCreationDate'),
    convertRelativeToAbsoluteDates: store.get('convertRelativeToAbsoluteDates'),
    notificationsAllowed: store.get('notificationsAllowed'),
    tray: store.get('tray'),
    showFileTabs: store.get('showFileTabs'),
    colorTheme: store.get('colorTheme'),
  });

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby='settings-modal-title'>
      <Box className='Modal' bgcolor='background.paper'>
        <h3>{t('settings.headline')}</h3>
        {Object.entries(settings).map(([settingName, settingValue]) => (
          settingName !== 'colorTheme' && (
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
        <FormControl>
          <InputLabel>{t('settings.colorTheme')}</InputLabel>
          <Select
            className='colorTheme'
            label={t('settings.colorTheme')}
            value={settings.colorTheme}
            onChange={handleSettingChange('colorTheme', setSettings)}
          >
            {['system', 'light', 'dark'].map((theme) => (
              <MenuItem key={theme} value={theme}>
                {t(`settings.${theme}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LanguageSelector />
      </Box>
    </Modal>
  );
};

export default withTranslation()(Settings);
