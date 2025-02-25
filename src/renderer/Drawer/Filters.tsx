import React from 'react'
import Link from '@mui/material/Link'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import HelpIcon from '@mui/icons-material/Help'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import { handleLinkClick } from '../Shared'
import './Filters.scss'

const { store } = window.api

const visibleSettings: VisibleSettings = {
  showCompleted: {
    style: 'toggle',
    rerender: true
  },
  showHidden: {
    style: 'toggle',
    rerender: true,
    help: 'https://github.com/ransome1/sleek/wiki/Hidden-todos-(h:)'
  },
  thresholdDateInTheFuture: {
    style: 'toggle',
    rerender: true
  },
  dueDateInTheFuture: {
    style: 'toggle',
    rerender: true
  }
}

interface DrawerFiltersComponentProps extends WithTranslation {
  settings: Settings
  t: typeof i18n.t
}

const DrawerFiltersComponent: React.FC<DrawerFiltersComponentProps> = ({ settings, t }) => {
  return (
    <div id="Filters">
      <FormGroup>
        {Object.entries(visibleSettings).map(([settingName, settingValue]) =>
          settingValue.style === 'toggle' ? (
            <FormControlLabel
              key={settingName}
              control={
                <Switch
                  data-testid={`setting-toggle-${settingName}`}
                  checked={!!settings[settingName as keyof Settings]}
                  onChange={(event) => store.setConfig(settingName, event.target.checked)}
                  name={settingName}
                />
              }
              label={
                settingValue.help ? (
                  <>
                    {t(`drawer.filters.${settingName}`)}
                    <Link onClick={(event) => settingValue.help && handleLinkClick(event, settingValue.help, settingValue.rerender)}>
                      <HelpIcon />
                    </Link>
                  </>
                ) : (
                  t(`drawer.filters.${settingName}`)
                )
              }
            />
          ) : null
        )}
      </FormGroup>
    </div>
  )
}

export default withTranslation()(DrawerFiltersComponent)
