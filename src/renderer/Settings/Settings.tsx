import React, { useEffect, memo } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import Link from '@mui/material/Link'
import Badge from '@mui/material/Badge'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Slider from '@mui/material/Slider'
import HelpIcon from '@mui/icons-material/Help'
import { withTranslation, WithTranslation } from 'react-i18next'
import LanguageSelector, { i18n } from './LanguageSelector'
import { handleLinkClick } from '../Shared'
import { dark, light } from '../Themes'
import './Settings.scss'

const { ipcRenderer, store } = window.api

const visibleSettings: VisibleSettings = {
  appendCreationDate: {
    style: 'toggle'
  },
  convertRelativeToAbsoluteDates: {
    style: 'toggle'
  },
  tray: {
    style: 'toggle'
  },
  invertTrayColor: {
    style: 'toggle'
  },
  menuBarVisibility: {
    style: 'toggle'
  },
  bulkTodoCreation: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Multi%E2%80%90line-text-field#bulk-todo-creation'
  },
  matomo: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/blob/main/PRIVACY.md'
  },
  disableAnimations: {
    style: 'toggle'
  },
  useHumanFriendlyDates: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Human-friendly-dates'
  },
  compact: {
    style: 'toggle'
  },
  notificationsAllowed: {
    style: 'toggle'
  },
  notificationThreshold: {
    style: 'slider',
    min: 0,
    max: 10,
    unit: ' days',
    step: 1,
    help: 'https://github.com/ransome1/sleek/wiki/Notifications-and-badges#notification-threshold'
  },
  zoom: {
    style: 'slider',
    min: 50,
    max: 150,
    unit: '%',
    step: 10
  },
  colorTheme: {
    style: 'select',
    values: ['system', 'light', 'dark']
  },
  weekStart: {
    style: 'select',
    values: [1, 0]
  }
}

interface SettingsComponentProps extends WithTranslation {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<string>>
  setTheme: React.Dispatch<React.SetStateAction<string>>
  setTodoData: React.Dispatch<React.SetStateAction<string>>
  t: typeof i18n.t
}

const SettingsComponent: React.FC<SettingsComponentProps> = memo(({ isOpen, onClose, settings, setIsSettingsOpen, setTheme, setTodoData, t }) => {
    
    useEffect(() => {
      if (settings.files?.length === 0) {
        setTodoData(null)
      }
    }, [settings.files])

    useEffect(() => {
      i18n
        .changeLanguage(settings.language)
        .then(() => {
          console.log(`Language set to "${settings.language}"`)
        })
        .catch((error) => {
          console.error(error)
        })
    }, [settings.language])

    useEffect(() => {
      const { shouldUseDarkColors, zoom, compact, disableAnimations } = settings;
      const adjustedFontSize = Math.round(14 * (zoom / 100));

      const updatedTheme = createTheme({
        ...(shouldUseDarkColors ? dark : light),
        typography: {
          fontFamily: 'Helvetica, Arial, sans-serif',
          fontSize: adjustedFontSize,
        },
      });

      setTheme(updatedTheme);

      document.body.classList.toggle('disableAnimations', disableAnimations);
      document.body.classList.toggle('compact', compact);
      document.body.classList.toggle('dark', shouldUseDarkColors);
      document.body.classList.toggle('light', !shouldUseDarkColors);

      return () => {
        document.body.classList.remove('dark', 'light', 'compact');
      };
    }, [settings.shouldUseDarkColors, settings.zoom, settings.compact, settings.disableAnimations]);    

    const handleClose = (): void => {
      setIsSettingsOpen(false)
    }

    return (
      <Dialog id="DialogSettingsComponent" open={isOpen} onClose={onClose}>
        <DialogTitle>{t('settings')}</DialogTitle>
        <DialogContent>
          {Object.entries(visibleSettings).map(([settingName, settingValue]) => {
            if (navigator.platform.startsWith('Mac') && settingName === 'menuBarVisibility') {
              return null
            }
            return settingValue.style === 'toggle' ? (
              <FormControlLabel
                key={settingName}
                control={
                  <Switch
                    data-testid={`setting-toggle-${settingName}`}
                    checked={settings[settingName as keyof Settings]}
                    onChange={(event) => store.setConfig(settingName, event.target.checked)}
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
                  ) : (
                    t(`settings.${settingName}`)
                  )
                }
              />
            ) : settingValue.style === 'select' ? (
              <FormControl key={settingName}>
                <InputLabel>{t(`settings.${settingName}`)}</InputLabel>
                {settingValue.help && (
                  <Badge
                    badgeContent={
                      <Link onClick={(event) => handleLinkClick(event, settingValue.help)}>
                        <HelpIcon />
                      </Link>
                    }
                  ></Badge>
                )}
                <Select
                  id={`settings-${settingName}`}
                  data-testid={`setting-select-${settingName}`}
                  className={settingName}
                  label={t(`settings.${settingName}`)}
                  value={settings[settingName as keyof Settings]}
                  onChange={(event) => store.setConfig(settingName, event.target.value)}
                >
                  {settingValue?.values?.map((value) => (
                    <MenuItem key={value} value={value}>
                      {t(`settings.${value}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : settingValue.style === 'slider' ? (
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
                      <Badge
                        badgeContent={
                          <Link onClick={(event) => handleLinkClick(event, settingValue.help)}>
                            <HelpIcon />
                          </Link>
                        }
                      >
                        {t(`settings.${settingName}`)}
                      </Badge>
                    ) : (
                      t(`settings.${settingName}`)
                    )
                  }
                  min={settingValue.min}
                  max={settingValue.max}
                  onChange={(_, value: number | number[]) => store.setConfig(settingName, value)}
                />
              </FormControl>
            ) : null
          })}
          <LanguageSelector settings={settings} />
        </DialogContent>
        <DialogActions>
          <button onClick={handleClose} data-testid="dialog-setting-button-close">
            {t('close')}
          </button>
        </DialogActions>
      </Dialog>
    )
  }
)

SettingsComponent.displayName = 'SettingsComponent'

export default withTranslation()(SettingsComponent)
