import React, { useEffect, memo } from 'react';
import Link from '@mui/material/Link';
import Badge from '@mui/material/Badge';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import HelpIcon from '@mui/icons-material/Help';
import { withTranslation, WithTranslation } from 'react-i18next';
import LanguageSelector, { i18n } from './LanguageSelector';
import { handleLinkClick } from '../Shared';
import './Settings.scss';

const { store } = window.api;

const visibleSettings: VisibleSettings = {
  appendCreationDate: {
    style: 'toggle',
  },
  convertRelativeToAbsoluteDates: {
    style: 'toggle',
  },
  tray: {
    style: 'toggle',
  },
  menuBarVisibility: {
    style: 'toggle',
  },
  bulkTodoCreation: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Multi%E2%80%90line-text-field#bulk-todo-creation',
  },
  matomo: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/blob/main/PRIVACY.md',
  },
  disableAnimations: {
    style: 'toggle',
  },
  useHumanFriendlyDates: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Human-friendly-dates',
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
    help: 'https://github.com/ransome1/sleek/wiki/Notifications-and-badges#notification-threshold',
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
  weekStart: {
    style: 'select',
    values: [1, 0],
  },
};

const handleChange = (settingName: string, value: string | boolean | number) => {
  store.setConfig(settingName, value);
};

interface SettingsProps extends WithTranslation {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<string>>,
  t: typeof i18n.t;
}

const Settings: React.FC<SettingsProps> = memo(({
  isOpen,
  onClose,
  settings,
  setIsSettingsOpen,
  t,
}) => {

  const handleClose = () => {
    setIsSettingsOpen(false);
  };
  
  useEffect(() => {
    const adjustedFontSize = 16 * (settings.zoom / 100);
    document.body.style.fontSize = `${adjustedFontSize}px`;
  }, [settings.zoom]);

  return (
    <Dialog
      id="DialogSettingsComponent"
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>{t('settings.headline')}</DialogTitle>
      <DialogContent>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) => {
          if (navigator.platform.startsWith('Mac') && settingName === 'menuBarVisibility') {
            return null;
          }
          return (
            settingValue.style === 'toggle' ? (
              <FormControlLabel
                key={settingName}
                control={
                  <Switch
                    data-testid={`setting-toggle-${settingName}`}
                    checked={settings[settingName as keyof Settings]}
                    onChange={(event) => handleChange(settingName, event.target.checked)}
                    name={settingName}
                  />
                }
                label={
                  settingValue.help ? (
                    <>
                      {t(`settings.${settingName}`)}
                      <Link onClick={(event) => handleLinkClick(event, settingValue.help)}>
                        <HelpIcon />
                      </Link>
                    </>
                  ) : t(`settings.${settingName}`)
                }
              />
            ) : (
              settingValue.style === 'select' ? (
                <FormControl 
                  key={settingName}
                >
                  <InputLabel>{t(`settings.${settingName}`)}</InputLabel>
                  {settingValue.help && (
                    <Badge badgeContent={
                      <Link onClick={(event) => handleLinkClick(event, settingValue.help)}>
                        <HelpIcon />
                      </Link>
                    }>
                    </Badge>
                  )}
                  <Select
                    id={`settings-${settingName}`}
                    data-testid={`setting-select-${settingName}`}
                    className={settingName}
                    label={t(`settings.${settingName}`)}
                    value={settings[settingName as keyof Settings]}
                    onChange={(event) => handleChange(settingName, event.target.value)}
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
                  <FormControl key={settingName} sx={{ clear: 'both' }}>
                    <label>
                      {t(`settings.${settingName}`)}
                      {settingValue.help ? (
                        <>
                          <Link onClick={(event) => handleLinkClick(event, settingValue.help)}>
                            <HelpIcon />
                          </Link>
                        </>
                      ) : null}
                    </label>
                    <Slider
                      id={settingName}
                      data-testid={`setting-slider-${settingName}`}
                      value={settings[settingName as keyof Settings]}
                      step={settingValue.step}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value: number): string => `${value}${settingValue.unit}`}
                      label={
                        settingValue.help ? (
                          <Badge badgeContent={
                            <Link onClick={(event) => handleLinkClick(event, settingValue.help)}>
                              <HelpIcon />
                            </Link>
                          }>
                            {t(`settings.${settingName}`)}
                          </Badge>
                        ) : (
                          t(`settings.${settingName}`)
                        )
                      }
                      min={settingValue.min}
                      max={settingValue.max}
                      onChange={(_, value: number | number[]) => handleChange(settingName, value)}
                    />
                  </FormControl>
                ) : null
              )
            )
          );
        })}
        <LanguageSelector
          settings={settings}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          data-testid="dialog-setting-button-close"
        >
          {t('todoDialog.footer.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default withTranslation()(Settings);
