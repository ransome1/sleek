import React from 'react';
import { Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import './Filters.scss';
import { i18n } from '../Settings/LanguageSelector';

const { store } = window.api;

const visibleSettings = {
  showCompleted: {
    style: 'toggle',
  },
  showHidden: {
    style: 'toggle',
  },
  thresholdDateInTheFuture: {
    style: 'toggle',
  },
  dueDateInTheFuture: {
    style: 'toggle',
  },
};

interface Props extends WithTranslation {
  settings: Settings;
  t: typeof i18n.t;
}

const DrawerFilters: React.FC<Props> = ({ 
  settings,
  t
}) => {
  return (
    <Box id="Filters">
      <FormGroup>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) => (
          settingValue.style === 'toggle' ? (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  checked={settings[settingName as keyof Settings]}
                  onChange={(event) => store.set(settingName, event.target.checked)}
                  name={settingName}
                />
              }
              label={t(`drawer.filters.${settingName}`)}
            />
          ) : null
        ))}
      </FormGroup>
    </Box>
  );
};

export default withTranslation()(DrawerFilters);