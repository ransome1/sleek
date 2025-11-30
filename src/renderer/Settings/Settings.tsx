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

/**
 * ============================================================================
 * SIMPLIFICATION ANALYSIS FOR OPINIONATED macOS APP
 * ============================================================================
 *
 * The following settings can be REMOVED or HARDCODED for a minimal experience:
 *
 * [REMOVE] Language selector (LanguageSelector.tsx)
 *   → Hardcode to 'en' or 'zh' based on your preference
 *   → Delete: src/renderer/Settings/LanguageSelector.tsx
 *   → Delete: src/locales/* (keep only one language file)
 *
 * [REMOVE] matomo
 *   → Analytics/privacy toggle - not needed for personal tool
 *
 * [REMOVE] menuBarVisibility
 *   → Already hidden on macOS (line 154-156), can be completely removed
 *
 * [REMOVE] invertTrayColor
 *   → macOS handles tray icons automatically with template images
 *
 * [HARDCODE] colorTheme → 'system'
 *   → Follow macOS system dark/light mode automatically
 *
 * [HARDCODE] weekStart → 1 (Monday)
 *   → Standard week start for productivity apps
 *
 * [HARDCODE] appendCreationDate → true
 *   → Best practice for todo.txt
 *
 * [HARDCODE] convertRelativeToAbsoluteDates → true
 *   → Better for persistence
 *
 * [HARDCODE] useHumanFriendlyDates → true
 *   → Better UX
 *
 * [KEEP] Essential settings:
 *   - zoom (accessibility)
 *   - compact (UI preference)
 *   - notificationsAllowed + notificationThreshold
 *   - tray + startMinimized (for menubar app behavior)
 *   - bulkTodoCreation (power user feature)
 *   - disableAnimations (accessibility)
 *
 * [SIMPLIFY] Multi-file management (FileTabs.tsx)
 *   → For a minimal app, consider supporting only ONE todo.txt file
 *   → Remove: src/renderer/Header/FileTabs.tsx
 *   → Simplify: src/main/File/* to handle single file only
 *
 * ============================================================================
 */

const visibleSettings: VisibleSettings = {
  // [NEW] Bi-Daily Unit View - Core feature for opinionated workflow
  biDailyView: {
    style: 'toggle'
  },
  // [HARDCODE as 'true'] - Best practice for todo.txt format
  appendCreationDate: {
    style: 'toggle'
  },
  // [HARDCODE as 'true'] - Better for data persistence
  convertRelativeToAbsoluteDates: {
    style: 'toggle'
  },
  // [HARDCODE as 'true'] - Better user experience
  useHumanFriendlyDates: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Human-friendly-dates'
  },
  // [KEEP] - Useful for menubar app mode on macOS
  tray: {
    style: 'toggle'
  },
  // [REMOVE] - macOS handles this automatically with template images
  invertTrayColor: {
    style: 'toggle',
    dependsOn: ['tray']
  },
  // [KEEP] - Useful for menubar app mode
  startMinimized: {
    style: 'toggle',
    dependsOn: ['tray']
  },
  // [REMOVE] - Not applicable to macOS (already conditionally hidden)
  menuBarVisibility: {
    style: 'toggle'
  },
  // [KEEP] - Power user feature
  bulkTodoCreation: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/wiki/Multi%E2%80%90line-text-field#bulk-todo-creation'
  },
  // [REMOVE] - Analytics not needed for personal tool
  matomo: {
    style: 'toggle',
    help: 'https://github.com/ransome1/sleek/blob/main/PRIVACY.md'
  },
  // [KEEP] - Accessibility feature
  disableAnimations: {
    style: 'toggle'
  },
  // [KEEP] - UI density preference
  compact: {
    style: 'toggle'
  },
  // [KEEP] - Notification feature
  notificationsAllowed: {
    style: 'toggle'
  },
  // [KEEP] - Notification configuration
  notificationThreshold: {
    style: 'slider',
    min: 0,
    max: 10,
    unit: ' days',
    step: 1,
    help: 'https://github.com/ransome1/sleek/wiki/Notifications-and-badges#notification-threshold'
  },
  // [KEEP] - Accessibility feature
  zoom: {
    style: 'slider',
    min: 50,
    max: 150,
    unit: '%',
    step: 10
  },
  // [HARDCODE as 'system'] - Follow macOS system preference
  colorTheme: {
    style: 'select',
    values: ['system', 'light', 'dark']
  },
  // [HARDCODE as 1] - Monday as standard week start
  weekStart: {
    style: 'select',
    values: [1, 6, 0]
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

            if(settingValue.dependsOn) {
              for (let i = 0; i < settingValue.dependsOn.length; i++) {
                if(!settings[settingValue.dependsOn[i]]) return null
              }
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
