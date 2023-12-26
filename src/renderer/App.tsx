import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import IpcComponent from './Ipc';
import MatomoComponent from './Matomo';
import { CssBaseline, Snackbar, Alert, Box } from '@mui/material';
import NavigationComponent from './Navigation';
import TodoDataGrid from './DataGrid/Grid';
import SplashScreen from './SplashScreen';
import FileTabs from './Header/FileTabs';
import { darkTheme, lightTheme } from './Themes';
import DrawerComponent from './Drawer/Drawer';
import Search from './Header/Search';
import TodoDialog from './TodoDialog/TodoDialog';
import Archive from './Archive';
import ToolBar from './Header/ToolBar';
import ContextMenu from './ContextMenu';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './Settings/LanguageSelector';
import Settings from './Settings/Settings';
import Prompt from './Prompt';
import { translatedAttributes } from './Shared';
import './App.scss';

const { ipcRenderer, store } = window.api;

const App = () => {
  const [settings, setSettings] = useState(store.get());
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const [todoObjects, setTodoObjects] = useState<TodoObject[] | null>(null);
  const [todoObject, setTodoObject] = useState<TodoObject | null>(null);
  const [attributeFields, setAttributeFields] = useState<TodoObject | null>(null);
  const [headers, setHeaders] = useState<HeadersObject | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem | null>(null);
  const [textFieldValue, setTextFieldValue] = useState<string | ''>('');
  const [promptItem, setPromptItem] = useState<PromptItem | null>(null);
  const [triggerArchiving, setTriggerArchiving] = useState<boolean>(false);
  const [showPromptDoneFile, setShowPromptDoneFile] = useState<boolean>(false);
  const searchFieldRef = useRef(null);

  const [attributeMapping, setAttributeMapping] = useState<TranslatedAttributes>(translatedAttributes(i18n.t) || {});

  useEffect(() => {
    if(!headers) {
      return;
    } else if(headers.availableObjects === 0) {
      setSplashScreen('noTodosAvailable');
    } else if(headers.visibleObjects === 0) {
      setSplashScreen('noTodosVisible');
    } else {
      setSplashScreen(null);
    }
  }, [headers]);

  useEffect(() => {
    if(settings.files?.length === 0) {
      setTodoObjects(null);
      setHeaders(null);
      setSplashScreen('noFiles');
    } else {
      ipcRenderer.send('requestData');
    }
  }, [settings.files]);

  useEffect(() => {
    if(!snackBarContent) {
      setSnackBarOpen(false);
    } else {
      setSnackBarOpen(true);
    }
  }, [snackBarContent]);

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
        setTriggerArchiving={setTriggerArchiving}
        setSplashScreen={setSplashScreen}
        setIsSettingsOpen={setIsSettingsOpen}
      />
      <MatomoComponent
        settings={settings}
      />      
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={settings.shouldUseDarkColors ? darkTheme : lightTheme}>
          <CssBaseline />
          <Box className={`flexContainer ${settings.isNavigationOpen ? '' : 'hideNavigation'} ${settings.shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}`}>
            <NavigationComponent
              setDialogOpen={setDialogOpen}
              settings={settings}
              setSettings={setSettings}
              setIsSettingsOpen={setIsSettingsOpen}
              setTodoObject={setTodoObject}
              setTriggerArchiving={setTriggerArchiving}
              headers={headers}
            />
            {settings.files?.length > 0 && (
              <DrawerComponent
                settings={settings}
                setSettings={setSettings}
                attributes={attributes}
                filters={filters}
                searchFieldRef={searchFieldRef}
                attributeMapping={attributeMapping}
              />
            )}
            <Box className="flexItems">
              {settings.files?.length > 0 && (
              <>
                {settings.showFileTabs ?
                <FileTabs
                  settings={settings}
                  setContextMenuPosition={setContextMenuPosition}
                  setContextMenuItems={setContextMenuItems}
                 /> : null}
                {headers?.availableObjects > 0 ?
                <>
                  <Search
                    headers={headers}
                    searchString={searchString}
                    setSearchString={setSearchString}
                    settings={settings}
                    
                    searchFieldRef={searchFieldRef}
                    setTextFieldValue={setTextFieldValue}
                  />
                  <ToolBar
                    settings={settings}
                    searchFieldRef={searchFieldRef}
                  />
                </>
                : null }
              </>
              )}
              <TodoDataGrid
                todoObjects={todoObjects}
                setTodoObject={setTodoObject}
                attributes={attributes}
                filters={filters}
                setDialogOpen={setDialogOpen}
                contextMenuPosition={contextMenuPosition}
                setContextMenuPosition={setContextMenuPosition}
                contextMenuItems={contextMenuItems}
                setContextMenuItems={setContextMenuItems}
                setPromptItem={setPromptItem}
                settings={settings}
              />
              <SplashScreen
                screen={splashScreen}
                setDialogOpen={setDialogOpen}
                setSearchString={setSearchString}
              />
            </Box>
          </Box>
          {dialogOpen ? (
            <TodoDialog
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
            attributeMapping={attributeMapping}
          />
          {contextMenuItems && (
            <ContextMenu
              contextMenuPosition={contextMenuPosition}
              setContextMenuPosition={setContextMenuPosition}
              contextMenuItems={contextMenuItems}
              setContextMenuItems={setContextMenuItems}
              setSnackBarSeverity={setSnackBarSeverity}
              setSnackBarContent={setSnackBarContent}
              setPromptItem={setPromptItem}
              setShowPromptDoneFile={setShowPromptDoneFile}
            />
          )}
          <Snackbar
            open={snackBarOpen}
            onClose={() => setSnackBarContent(null)}
            autoHideDuration={3000}
          >
            <Alert
              severity={snackBarSeverity}
            >
              {snackBarContent}
            </Alert>
          </Snackbar>
          {settings.files?.length > 0 && (
            <Archive
              setSnackBarSeverity={setSnackBarSeverity}
              setSnackBarContent={setSnackBarContent}
              triggerArchiving={triggerArchiving}
              settings={settings}
              setTriggerArchiving={setTriggerArchiving}
              showPromptDoneFile={showPromptDoneFile}
              setShowPromptDoneFile={setShowPromptDoneFile}
              headers={headers}
            />
          )}
          {promptItem && (
            <Prompt
              open={true}
              onClose={() => setPromptItem(null)}
              promptItem={promptItem}
              setContextMenuItems={setContextMenuItems}
              headline={promptItem.headline || ''}
              text={promptItem.text || ''}
              confirmButton={promptItem.label}
            />
          )}
        </ThemeProvider>
      </I18nextProvider>
    </>
  );
};

export default App;
