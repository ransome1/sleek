import React, { useState, useRef, useEffect, memo } from 'react'
import Drawer from '@mui/material/Drawer'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import FilterListIcon from '@mui/icons-material/FilterList'
import TuneIcon from '@mui/icons-material/Tune'
import DrawerAttributes from './Attributes'
import DrawerSorting from './Sorting'
import DrawerFilters from './Filters'
import { handleReset } from '../Shared'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './Drawer.scss'

const { store } = window.api

interface Props extends WithTranslation {
  settings: Settings
  attributes: Attributes | null
  filters: Filters | null
  searchFieldRef: React.RefObject<HTMLInputElement>
  t: typeof i18n.t
}

const DrawerComponent: React.FC<Props> = memo(
  ({ settings, attributes, filters, searchFieldRef, t }) => {
    const [activeTab, setActiveTab] = useState<string>('attributes')
    const [drawerWidth, setDrawerWidth] = useState<number>(store.getConfig('drawerWidth') || 500)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const startXRef = useRef<number>(0)

    const handleTabChange = (_event: React.ChangeEvent<unknown>, newValue: string): void => {
      setActiveTab(newValue)
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
      startXRef.current = event.pageX
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    const handleMouseMove = (event: MouseEvent): void => {
      startXRef.current = event.pageX
      setDrawerWidth(event.pageX - 80 >= 165 ? event.pageX - 80 : 165)
    }

    const handleMouseUp = (): void => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const isSearchFocused = document.activeElement === searchFieldRef.current
      if (!isSearchFocused && event.key === 'Escape') {
        store.setConfig('isDrawerOpen', false)
      }
    }

    useEffect(() => {
      store.setConfig('drawerWidth', drawerWidth)
    }, [drawerWidth])

    useEffect(() => {
      const handleKeyDownListener = (event: KeyboardEvent): void => handleKeyDown(event)
      document.addEventListener('keydown', handleKeyDownListener)
      return (): void => {
        document.removeEventListener('keydown', handleKeyDownListener)
      }
    }, [])

    return (
      <Drawer
        id="drawer"
        ref={containerRef}
        variant="persistent"
        open={settings.isDrawerOpen}
        className={`${settings.isDrawerOpen ? 'open' : ''}`}
        style={{ width: drawerWidth, marginLeft: -drawerWidth }}
      >
        <div className="drawerHandle" onMouseDown={handleMouseDown} />
        <Tabs className="tabs" centered value={activeTab} onChange={handleTabChange}>
          <Tab
            tabIndex={0}
            label={
              <>
                {t('attributes')}
                {Object.values(filters).some(
                  (array) => Array.isArray(array) && array.length > 0
                ) && <RemoveCircleIcon onClick={handleReset} className="reset" />}
              </>
            }
            value="attributes"
            icon={<FilterAltIcon />}
            data-testid={'drawer-tab-attributes'}
          />
          <Tab
            tabIndex={0}
            label={t('filters')}
            value="filters"
            icon={<TuneIcon />}
            data-testid={'drawer-tab-filters'}
          />
          <Tab
            tabIndex={0}
            label={t('sorting')}
            value="sorting"
            icon={<FilterListIcon />}
            data-testid={'drawer-tab-sorting'}
          />
        </Tabs>
        {settings.isDrawerOpen && activeTab === 'attributes' && (
          <DrawerAttributes settings={settings} attributes={attributes} filters={filters} />
        )}
        {settings.isDrawerOpen && activeTab === 'filters' && <DrawerFilters settings={settings} />}
        {settings.isDrawerOpen && activeTab === 'sorting' && <DrawerSorting settings={settings} />}
      </Drawer>
    )
  }
)

DrawerComponent.displayName = 'DrawerComponent'

export default withTranslation()(DrawerComponent)
