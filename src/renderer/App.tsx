import { useEffect, useState, useRef } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import IpcComponent from './IpcRenderer'
import MatomoComponent from './Matomo'
import CssBaseline from '@mui/material/CssBaseline'
import Snackbar from '@mui/material/Snackbar'
import Alert, { AlertColor } from '@mui/material/Alert'
import NavigationComponent from './Navigation'
import GridComponent from './Grid/Grid'
import SplashScreen from './SplashScreen'
import FileTabs from './Header/FileTabs'
import { dark, light } from './Themes'
import DrawerComponent from './Drawer/Drawer'
import SearchComponent from './Header/Search/Search'
import DialogComponent from './Dialog/Dialog'
import Archive from './Archive'
import HeaderComponent from './Header/Header'
import ContextMenu from './ContextMenu'
import { I18nextProvider } from 'react-i18next'
import { i18n } from './Settings/LanguageSelector'
import Settings from './Settings/Settings'
import Prompt from './Prompt'
import KanbanView from './Kanban/KanbanView'
import './App.scss'
import './Buttons.scss'
import './Form.scss'

const { store, ipcRenderer } = window.api

const App = (): JSX.Element => {
  const [settings, setSettings] = useState<Settings>(store.getConfig())
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false)
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null)
  const [snackBarSeverity, setSnackBarSeverity] = useState<AlertColor | undefined>()
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [searchString, setSearchString] = useState<string | null>(null)
  const [todoData, setTodoData] = useState<TodoData | null>(null)
  const [todoObject, setTodoObject] = useState<TodoObject | null>(null)
  const [attributeFields, setAttributeFields] = useState<TodoObject | null>(null)
  const [headers, setHeaders] = useState<HeadersObject | null>(null)
  const [filters, setFilters] = useState<Filters | null>([])
  const [attributes, setAttributes] = useState<Attributes | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
  const [promptItem, setPromptItem] = useState<PromptItem | null>(null)
  const [triggerArchiving, setTriggerArchiving] = useState<boolean>(false)
  const [theme, setTheme] = useState(
    createTheme({
      ...(settings?.shouldUseDarkColors ? dark : light),
        typography: {
          fontSize: Math.round(14 * (settings.zoom / 100)),
        },
      })
  );
  const searchFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSnackBarOpen(Boolean(snackBarContent))
  }, [snackBarContent])

  useEffect(() => {
    ipcRenderer.send('requestData')
  }, [])

  return (
    <>
      <IpcComponent
        setHeaders={setHeaders}
        setAttributes={setAttributes}
        setFilters={setFilters}
        setTodoData={setTodoData}
        setTodoObject={setTodoObject}
        setAttributeFields={setAttributeFields}
        setSnackBarSeverity={setSnackBarSeverity}
        setSnackBarContent={setSnackBarContent}
        setSettings={setSettings}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      {settings.matomo && <MatomoComponent settings={settings} />}
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div
            className={`flexContainer ${settings?.isNavigationOpen ? '' : 'hideNavigation'}`}
          >
            <NavigationComponent
              setDialogOpen={setDialogOpen}
              settings={settings}
              setIsSettingsOpen={setIsSettingsOpen}
              setTodoObject={setTodoObject}
              headers={headers}
            />
            {settings?.files?.length > 0 && (
              <DrawerComponent
                settings={settings}
                attributes={attributes}
                filters={filters}
                searchFieldRef={searchFieldRef}
              />
            )}
            <div className="flexItems">
              {settings.files?.length > 0 && (
                <>
                  {settings.showFileTabs ? (
                    <FileTabs settings={settings} setContextMenu={setContextMenu} />
                  ) : null}
                  {headers && headers.availableObjects > 0 ? (
                    <>
                      <SearchComponent
                        headers={headers}
                        searchString={searchString}
                        setSearchString={setSearchString}
                        settings={settings}
                        searchFieldRef={searchFieldRef}
                        setPromptItem={setPromptItem}
                      />
                      <HeaderComponent settings={settings} searchFieldRef={searchFieldRef} />
                    </>
                  ) : null}
                </>
              )}
              {todoData && headers.availableObjects > 0 && (
                <>
                  {settings.viewMode === 'kanban' ? (
                    <KanbanView
                      todoData={todoData}
                      setTodoObject={setTodoObject}
                      setDialogOpen={setDialogOpen}
                      setContextMenu={setContextMenu}
                      setPromptItem={setPromptItem}
                    />
                  ) : (
                    <GridComponent
                      todoData={todoData}
                      setTodoObject={setTodoObject}
                      filters={filters}
                      setDialogOpen={setDialogOpen}
                      setContextMenu={setContextMenu}
                      setPromptItem={setPromptItem}
                      settings={settings}
                      headers={headers}
                      searchString={searchString}
                    />
                  )}
                </>
              )}
              <SplashScreen
                setDialogOpen={setDialogOpen}
                setSearchString={setSearchString}
                headers={headers}
                settings={settings}
              />
            </div>
          </div>
          {dialogOpen ? (
            <DialogComponent
              todoObject={todoObject}
              setTodoObject={setTodoObject}
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              attributes={attributes}
              attributeFields={attributeFields}
              setAttributeFields={setAttributeFields}
              setSnackBarSeverity={setSnackBarSeverity}
              setSnackBarContent={setSnackBarContent}
              settings={settings}
            />
          ) : null}
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            setIsSettingsOpen={setIsSettingsOpen}
            setTheme={setTheme}
            setTodoData={setTodoData}
          />
          {contextMenu && (
            <ContextMenu
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              setPromptItem={setPromptItem}
            />
          )}
          <Snackbar
            open={snackBarOpen}
            onClose={() => setSnackBarContent(null)}
            autoHideDuration={3000}
          >
            <Alert severity={snackBarSeverity} data-testid={`snackbar-${snackBarSeverity}`}>
              {snackBarContent}
            </Alert>
          </Snackbar>
          {settings?.files?.length > 0 && (
            <Archive
              triggerArchiving={triggerArchiving}
              setTriggerArchiving={setTriggerArchiving}
              settings={settings}
              setPromptItem={setPromptItem}
              headers={headers}
            />
          )}
          {promptItem && (
            <Prompt
              open={true}
              onClose={() => setPromptItem(null)}
              promptItem={promptItem}
              setPromptItem={setPromptItem}
              setContextMenu={setContextMenu}
            />
          )}
        </ThemeProvider>
      </I18nextProvider>
    </>
  )
}

export default App
