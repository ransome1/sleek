import React, { useState } from 'react';
import { Box, FormGroup, FormControlLabel, Switch } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import { handleSettingChange } from '../Shared';
import { Settings } from '../../main/util';
import './Filters.scss';
import { i18n } from '../LanguageSelector';

const { store } = window.api;

interface Props extends WithTranslation {
  t: typeof i18n.t;
}

const DrawerFilters: React.FC<Props> = ({ 
  t
}) => {
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
