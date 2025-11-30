import React, { useEffect, memo } from 'react'
import AddIcon from '@mui/icons-material/Add'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import InventoryIcon from '@mui/icons-material/Inventory'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import SettingsIcon from '@mui/icons-material/Settings'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ChecklistIcon from '@mui/icons-material/Checklist'
import Tooltip from '@mui/material/Tooltip'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from './Settings/LanguageSelector'
import LanguageSwitcher from './Header/LanguageSwitcher'
import './Navigation.scss'

const { ipcRenderer, store } = window.api

type ViewMode = 'list' | 'bidaily' | 'calendar'

interface NavigationComponentProps extends WithTranslation {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  settings: Settings
  headers: HeadersObject | null
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  viewMode?: ViewMode
  setViewMode?: React.Dispatch<React.SetStateAction<ViewMode>>
  batchMode?: boolean
  setBatchMode?: React.Dispatch<React.SetStateAction<boolean>>
  t: typeof i18n.t
}

const NavigationComponent: React.FC<NavigationComponentProps> = memo(
  ({ setIsSettingsOpen, setDialogOpen, settings, headers, setTodoObject, viewMode, setViewMode, batchMode, setBatchMode, t }) => {
    const handleOpen = (): void => {
      if (settings.files?.length > 0) {
        setTodoObject(null)
        setDialogOpen(true)
      }
    }

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.ctrlKey && event.key === 'т') {
          handleOpen()
        }
      }

      ipcRenderer.on('isDialogOpen', handleOpen)
      document.addEventListener('keydown', handleKeyDown)
      return (): void => {
        ipcRenderer.off('isDialogOpen', handleOpen)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [])

    return (
      <>
        <ul id="navigation">
          <li className="logo">sleek</li>
          {settings.files?.length > 0 && (
            <>
              <li
                onClick={() => handleOpen()}
                data-testid="navigation-button-add-todo"
                title={t('add')}
              >
                <AddIcon />
              </li>
              <li
                onClick={() => store.setConfig('isDrawerOpen', !settings.isDrawerOpen)}
                className={settings.isDrawerOpen ? 'active' : ''}
                data-testid="navigation-button-toggle-drawer"
                title={`${t('attributes')}, ${t('filters')}, ${t('sorting')}`}
              >
                <FilterAltIcon />
              </li>

              {/* View Mode Switcher */}
              {setViewMode && (
                <li className="view-mode-group">
                  <Tooltip title={t('viewMode.list')} arrow placement="right">
                    <span
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'active' : ''}
                      data-testid="navigation-view-list"
                    >
                      <ViewListIcon fontSize="small" />
                    </span>
                  </Tooltip>
                  <Tooltip title={t('viewMode.bidaily')} arrow placement="right">
                    <span
                      onClick={() => setViewMode('bidaily')}
                      className={viewMode === 'bidaily' ? 'active' : ''}
                      data-testid="navigation-view-bidaily"
                    >
                      <ViewModuleIcon fontSize="small" />
                    </span>
                  </Tooltip>
                  <Tooltip title={t('viewMode.calendar')} arrow placement="right">
                    <span
                      onClick={() => setViewMode('calendar')}
                      className={viewMode === 'calendar' ? 'active' : ''}
                      data-testid="navigation-view-calendar"
                    >
                      <CalendarMonthIcon fontSize="small" />
                    </span>
                  </Tooltip>
                </li>
              )}

              {/* Batch Mode Toggle */}
              {setBatchMode && (
                <Tooltip title={t('batchMode.toggle')} arrow placement="right">
                  <li
                    onClick={() => setBatchMode(!batchMode)}
                    className={batchMode ? 'active batch-mode' : 'batch-mode'}
                    data-testid="navigation-batch-mode"
                  >
                    <ChecklistIcon />
                  </li>
                </Tooltip>
              )}

              {headers && headers.completedObjects > 0 && (
                <>
                  <li
                    onClick={() => ipcRenderer.send('requestArchive')}
                    data-testid="navigation-button-archive-todos"
                    title={t('archive')}
                  >
                    <InventoryIcon />
                  </li>
                </>
              )}
            </>
          )}
          <li
            onClick={() => ipcRenderer.send('openFile', false)}
            data-testid="navigation-button-open-file"
            title={t('openFile')}
          >
            <FileOpenIcon />
          </li>
          <li className="break language-switcher-wrapper">
            <LanguageSwitcher settings={settings} />
          </li>
          <li
            onClick={() => setIsSettingsOpen(true)}
            data-testid="navigation-button-show-settings"
            title={t('settings')}
          >
            <SettingsIcon />
          </li>
          <li
            onClick={() => store.setConfig('isNavigationOpen', false)}
            data-testid="navigation-button-hide-navigation"
          >
            <KeyboardArrowLeftIcon />
          </li>
          <li
            onClick={() => store.setConfig('isNavigationOpen', true)}
            className="showNavigation"
            data-testid="navigation-button-show-navigation"
          >
            <KeyboardArrowRightIcon />
          </li>
        </ul>
      </>
    )
  }
)

NavigationComponent.displayName = 'NavigationComponent' // Set displayName explicitly

export default withTranslation()(NavigationComponent)
