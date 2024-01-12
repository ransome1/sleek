import React from 'react';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import HelpIcon from '@mui/icons-material/Help';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './Filters.scss';

const { store, ipcRenderer } = window.api;

const visibleSettings = {
  showCompleted: {
    style: 'toggle',
  },
  showHidden: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Hidden-todos-(h:)',
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
              label={
                settingValue.help ? (
                  <>
                    {t(`drawer.filters.${settingName}`)}
                    <Link onClick={() => ipcRenderer.send('openInBrowser', settingValue.help)}>
                      <HelpIcon />
                    </Link>
                  </>
                ) : t(`drawer.filters.${settingName}`)
              }
            />
          ) : null
        ))}
      </FormGroup>
    </Box>
  );
};

export default withTranslation()(DrawerFilters);