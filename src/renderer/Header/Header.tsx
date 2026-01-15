import React, { useEffect, useCallback, RefObject, memo } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import './Header.scss'

interface HeaderComponentProps {
  settings: Settings
  searchFieldRef: RefObject<HTMLInputElement>
}

const { store } = window.api

const HeaderComponent: React.FC<HeaderComponentProps> = memo(({ settings, searchFieldRef }) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      const isSearchFocused = document.activeElement === searchFieldRef.current
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key === 'f' &&
        settings.isSearchOpen &&
        !isSearchFocused
      ) {
        event.preventDefault()
        searchFieldRef.current?.focus()
      }
    },
    [settings.isSearchOpen, searchFieldRef]
  )

  const handleOnClick = (): void => {
    store.setConfig('isSearchOpen', !settings.isSearchOpen)
  }

  const handleViewModeToggle = (): void => {
    const newMode = settings.viewMode === 'list' ? 'kanban' : 'list'
    store.setConfig('viewMode', newMode)
  }

  useEffect(() => {
    const handleDocumentKeyDown = (event: KeyboardEvent): void => handleKeyDown(event)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return (): void => {
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [handleKeyDown])

  return (
    settings.showFileTabs && (
      <div id="ToolBar">
        <div onClick={handleOnClick}>
          <SearchIcon
            className={settings.isSearchOpen ? 'active' : ''}
            data-testid={'header-search-icon'}
          />
        </div>
        <Tooltip title={settings.viewMode === 'list' ? 'Switch to Kanban view' : 'Switch to List view'}>
          <IconButton onClick={handleViewModeToggle} size="small">
            {settings.viewMode === 'list' ? <ViewKanbanIcon /> : <ViewListIcon />}
          </IconButton>
        </Tooltip>
      </div>
    )
  )
})

HeaderComponent.displayName = 'HeaderComponent'

export default HeaderComponent
