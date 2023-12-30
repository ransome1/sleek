import React, { useEffect, memo } from 'react';
import { Box, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, Switch, Slider } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import './Settings.scss';

const { store } = window.api;

interface Props extends WithTranslation {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  attributeMapping: TranslatedAttributes;
  t: typeof i18n.t;
}

const visibleSettings: VisibleSettings = {
  appendCreationDate: {
    style: 'toggle',
  },
  convertRelativeToAbsoluteDates: {
    style: 'toggle',
  },
  showFileTabs: {
    style: 'toggle',
  },
  tray: {
    style: 'toggle',
  },
  bulkTodoCreation: {
    style: 'toggle',
  },
  matomo: {
    style: 'toggle',
  },
  notificationsAllowed: {
    style: 'toggle',
  },
  notificationThreshold: {
    style: 'slider',
    min: 0,
    max: 10,
    unit: ' days',
    step: 1,
  },
  zoom: {
    style: 'slider',
    min: 75,
    max: 125,
    unit: '%',
    step: 5,
  },
  colorTheme: {
    style: 'select',
    values: ['system', 'light', 'dark'],
  },
};

const Settings: React.FC<Props> = memo(({
  isOpen,
  onClose,
  settings,
  t,
}) => {

  useEffect(() => {
    const adjustedFontSize = 16 * (settings.zoom / 100);
    document.body.style.fontSize = `${adjustedFontSize}px`;
  }, [settings.zoom]);

  return (
    <Modal id='settings' open={isOpen} onClose={onClose} aria-labelledby='settings-modal-title'>
      <Box className='Modal' bgcolor='background.paper'>
        <h3>{t('settings.headline')}</h3>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) => (
          settingValue.style === 'toggle' ? (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  data-testid={`setting-toggle-${settingName}`}
                  checked={settings[settingName as keyof Settings]}
                  onChange={(event) => store.set(settingName, event.target.checked)}
                  name={settingName}
                />
              }
              label={t(`settings.${settingName}`)}
            />
          ) : (
            settingValue.style === 'select' ? (
              <FormControl 
                key={settingName}
              >
                <InputLabel>{t(`settings.${settingName}`)}</InputLabel>
                <Select
                  id={`settings-${settingName}`}
                  data-testid={`setting-select-${settingName}`}
                  className={settingName}
                  label={t(`settings.${settingName}`)}
                  value={settings[settingName as keyof Settings]}
                  onChange={(event) => store.set(settingName, event.target.value)}
                >
                  {settingValue?.values?.map((value) => (
                    <MenuItem key={value} value={value}>
                      {t(`settings.${value}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              settingValue.style === 'slider' ? (
                <FormControl key={settingName} sx={{ width: 300, clear: 'both' }}>
                  {t(`settings.${settingName}`)}
                  <Slider
                    id={settingName}
                    data-testid={`setting-slider-${settingName}`}
                    value={settings[settingName as keyof Settings]}
                    step={settingValue.step}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value: number): string => `${value}${settingValue.unit}`}
                    min={settingValue.min}
                    max={settingValue.max}
                    onChange={(event: Event, value: number | number[]) => {
                      event.preventDefault();
                      if (typeof value === 'number') {
                        store.set(settingName, value);
                      }
                    }}
                  />

                </FormControl>

              ) : null
            )
          )
        ))}
        <LanguageSelector
          settings={settings}
        />
      </Box>
    </Modal>
  );
});

export default withTranslation()(Settings);
