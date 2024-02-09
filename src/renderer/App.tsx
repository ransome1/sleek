import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import IpcComponent from './IpcRenderer';
import MatomoComponent from './Matomo';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import NavigationComponent from './Navigation';
import GridComponent from './Grid/Grid';
import SplashScreen from './SplashScreen';
import FileTabs from './Header/FileTabs';
import { darkTheme, lightTheme } from './Themes';
import DrawerComponent from './Drawer/Drawer';
import SearchComponent from './Header/Search/Search';
import DialogComponent from './Dialog/Dialog';
import Archive from './Archive';
import HeaderComponent from './Header/Header';
import ContextMenu from './ContextMenu';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './Settings/LanguageSelector';
import Settings from './Settings/Settings';
import Prompt from './Prompt';
import './App.scss';

const { ipcRenderer, store } = window.api;

const translatedAttributes = (t: typeof i18n.t) => ({
  t: t('shared.attributeMapping.t'),
  due: t('shared.attributeMapping.due'),
  projects: t('shared.attributeMapping.projects'),
  contexts: t('shared.attributeMapping.contexts'),
  priority: t('shared.attributeMapping.priority'),
  rec: t('shared.attributeMapping.rec'),
  pm: t('shared.attributeMapping.pm'),
  created: t('shared.attributeMapping.created'),
  completed: t('shared.attributeMapping.completed'),
});

const App = () => {
  const [settings, setSettings] = useState<Settings>(store.getConfig());
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<AlertColor | undefined>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const [todoObjects, setTodoObjects] = useState<TodoObject[] | null>(null);
  const [todoObject, setTodoObject] = useState<TodoObject | null>(null);
  const [attributeFields, setAttributeFields] = useState<TodoObject | null>(null);
  const [headers, setHeaders] = useState<HeadersObject | null>(null);
  const [filters, setFilters] = useState<Filters | null>([]);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [textFieldValue, setTextFieldValue] = useState<string>('');
  const [promptItem, setPromptItem] = useState<PromptItem | null>(null);
  const [triggerArchiving, setTriggerArchiving] = useState<boolean>(false);
  const searchFieldRef = useRef<HTMLInputElement>(null);
  const [attributeMapping] = useState<TranslatedAttributes>(translatedAttributes(i18n.t) || {});
  const [visibleRowCount, setVisibleRowCount] = useState(50);
  const [loadMoreRows, setLoadMoreRows] = useState(true);

  useEffect(() => {
    setSnackBarOpen(Boolean(snackBarContent));
  }, [snackBarContent]);

  useEffect(() => {
    if(settings.files?.length === 0) {
      setTodoObjects(null);
    }
  }, [settings.files]);

  useEffect( () =>  {
    i18n.changeLanguage(settings.language)
      .then(() => {
        console.log(`Language set to "${settings.language}"`);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [settings.language]);  

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const calculatedRowCount = Math.floor(windowHeight / 35) * 2;
    setVisibleRowCount(calculatedRowCount);
    setLoadMoreRows(true);
    ipcRenderer.send('requestData');
  }, []);

  return (
    <>
      <IpcComponent
        setHeaders={setHeaders}
        setAttributes={setAttributes}
        setFilters={setFilters}
        setTodoObjects={setTodoObjects}
        setTodoObject={setTodoObject}
        setAttributeFields={setAttributeFields}
        setSnackBarSeverity={setSnackBarSeverity}
        setSnackBarContent={setSnackBarContent}
        setSettings={setSettings}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      {settings.matomo && (
        <MatomoComponent
          settings={settings}
        />
      )}
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={settings?.shouldUseDarkColors ? darkTheme : lightTheme}>
          <CssBaseline />
          <div className={`flexContainer ${settings?.isNavigationOpen ? '' : 'hideNavigation'} ${settings?.shouldUseDarkColors ? 'darkTheme' : 'lightTheme'} ${settings.disableAnimations ? 'disableAnimations' : ''}`}>
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
                attributeMapping={attributeMapping}
              />
            )}
            <div className="flexItems">
              {settings.files?.length > 0 && (
              <>
                {settings.showFileTabs ?
                <FileTabs
                  settings={settings}
                  setContextMenu={setContextMenu}
                 /> : null}
                {headers && headers.availableObjects > 0 ?
                <>
                  <SearchComponent
                    headers={headers}
                    searchString={searchString}
                    setSearchString={setSearchString}
                    settings={settings}
                    searchFieldRef={searchFieldRef}
                    setPromptItem={setPromptItem}
                  />
                  <HeaderComponent
                    settings={settings}
                    searchFieldRef={searchFieldRef}
                  />
                </>
                : null }
              </>
              )}
              {todoObjects && todoObjects.length > 0 && (
                <>
                  <GridComponent
                    todoObjects={todoObjects}
                    setTodoObject={setTodoObject}
                    filters={filters}
                    setDialogOpen={setDialogOpen}
                    setContextMenu={setContextMenu}
                    setPromptItem={setPromptItem}
                    settings={settings}
                    visibleRowCount={visibleRowCount}
                    setVisibleRowCount={setVisibleRowCount}
                    loadMoreRows={loadMoreRows}
                    setLoadMoreRows={setLoadMoreRows}
                  />
                </>
              )}
              <SplashScreen
                setDialogOpen={setDialogOpen}
                setSearchString={setSearchString}
                headers={headers}
                settings={settings}
                todoObjects={todoObjects}
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
              textFieldValue={textFieldValue}
              setTextFieldValue={setTextFieldValue}
              settings={settings}
            />
          ) : null}
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
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
            <Alert 
              severity={snackBarSeverity}
              data-testid={`snackbar-${snackBarSeverity}`}
            >
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
  );
};

export default App;
