import React, { MouseEvent } from 'react';
import Link from '@mui/material/Link';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import HelpIcon from '@mui/icons-material/Help';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import './Filters.scss';

const { store, ipcRenderer } = window.api;

const visibleSettings: VisibleSettings = {
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

const handleHelpClick = (event: MouseEvent, url: string) => {
  event.preventDefault();
  event.stopPropagation();
  if(url) {
    ipcRenderer.send('openInBrowser', url)
  }
};

const handleChange = (settingName: string, value: string | boolean) => {
  store.setConfig(settingName, value);
};

interface DrawerFiltersProps extends WithTranslation {
  settings: Settings;
  t: typeof i18n.t;
}

const DrawerFilters: React.FC<DrawerFiltersProps> = ({
  settings,
  t
}) => {
  return (
    <div id="Filters">
      <FormGroup>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) => (
          settingValue.style === 'toggle' ? (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  data-testid={`setting-toggle-${settingName}`}
                  checked={!!settings[settingName as keyof Settings]}
                  onChange={(event) => handleChange(settingName, event.target.checked)}
                  name={settingName}
                />
              }
              label={
                settingValue.help ? (
                  <>
                    {t(`drawer.filters.${settingName}`)}
                    <Link onClick={(event) => settingValue.help && handleHelpClick(event, settingValue.help)}>
                      <HelpIcon />
                    </Link>
                  </>
                ) : t(`drawer.filters.${settingName}`)
              }
            />
          ) : null
        ))}
      </FormGroup>
    </div>
  );
};

export default withTranslation()(DrawerFilters);