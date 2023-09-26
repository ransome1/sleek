import React, { useState } from 'react';
import { Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { withTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import { handleSettingChange } from './Shared';
import './DrawerFilters.scss';

const store = window.api.store;

interface Settings {
  showCompleted: boolean;
  showHidden: boolean;
  thresholdDateInTheFuture: boolean;
  dueDateInTheFuture: boolean;
}

const DrawerFilters: React.FC = ({ t }) => {
  const [settings, setSettings] = useState<Settings>({
    showCompleted: store.get('showCompleted'),
    showHidden: store.get('showHidden'),
    thresholdDateInTheFuture: store.get('thresholdDateInTheFuture'),
    dueDateInTheFuture: store.get('dueDateInTheFuture'),
  });

  return (
    <Box id="Filters">
      <FormGroup>
        {Object.entries(settings).map(([settingName, value]) => (
          <FormControlLabel
            key={settingName}
            control={
              <Switch
                checked={value}
                onChange={handleSettingChange(settingName, setSettings)}
                name={settingName}
              />
            }
            label={t(`drawer.filters.${settingName}`)}
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export default withTranslation()(DrawerFilters);
