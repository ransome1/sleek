import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert, Box } from '@mui/material';
import NavigationComponent from './Navigation';
import TodoDataGrid from './DataGrid/Grid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import { darkTheme, lightTheme } from './Themes';
import DrawerComponent from './Drawer/Drawer';
import Search from './Search';
import TodoDialog from './TodoDialog/TodoDialog';
import Archive from './Archive';
import ToolBar from './ToolBar';
import ContextMenu from './ContextMenu';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './LanguageSelector';
import Settings from './Settings';
import { translatedAttributes } from './Shared';
import Prompt from './Prompt';
import './App.scss';

const environment = process.env.NODE_ENV;
const { ipcRenderer, store } = window.api;

const App = () => {
  const [files, setFiles] = useState<FileObject[]>(store.get('files') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(store.get('isDrawerOpen') || false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(store.get('isSearchOpen') || false);
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const [flattenedTodoObjects, setTodoObjects] = useState<TodoObject[] | null>(null);
  const [todoObject, setTodoObject] = useState<TodoObject | null>(null);
  const [headers, setHeaders] = useState<Headers | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [attributes, setAttributes] = useState<Attributes | null>(null);
  const [sorting, setSorting] = useState<Sorting>(store.get('sorting') || null);
  const [zoom, setZoom] = useState<number>(store.get('zoom') || 100);
  const [isNavigationOpen, setIsNavigationOpen] = useState<boolean>(store.get('isNavigationOpen'));
  const [shouldUseDarkColors, setShouldUseDarkColors] = useState<boolean>(store.get('shouldUseDarkColors') || false);
  const [showFileTabs, setShowFileTabs] = useState<boolean>(store.get('showFileTabs'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [contextMenuItems, setContextMenuItems] = useState<ContextMenuItem | null>(null);
  const [attributeMapping, setAttributeMapping] = useState<TranslatedAttributes>(translatedAttributes(i18n.t) || {});
  const [textFieldValue, setTextFieldValue] = useState<string | null>(null);
  const [promptItem, setPromptItem] = useState<PromptItem | null>(null);
  const [triggerArchiving, setTriggerArchiving] = useState<boolean>(false);
  const [showPromptDoneFile, setShowPromptDoneFile] = useState<boolean>(false);
  const [matomo, setMatomo] = useState<boolean>(store.get('matomo') || false);
  const searchFieldRef = useRef(null);

  const handleRequestedData = (requestedData: RequestedData) => {
    if(requestedData?.headers) setHeaders(requestedData.headers);
    if(requestedData?.attributes) setAttributes(requestedData.attributes);
    if(requestedData?.filters) setFilters(requestedData.filters);
    if(requestedData?.flattenedTodoObjects) setTodoObjects(requestedData.flattenedTodoObjects);
    setSplashScreen(null);
  };

  const handleUpdateFiles = (files: FileObject[]) => {
    setFiles(files);
  };

  const handleUpdateSorting = (sorting: Sorting) => {
    setSorting(sorting)
  };

  const handleSetIsSearchOpen = () => {
    setIsSearchOpen(prevIsSearchOpen => !prevIsSearchOpen);
  };

  const handleSetIsNavigationOpen = () => {
    setIsNavigationOpen(prevIsNavigationOpen => !prevIsNavigationOpen);
  };

  const handleSetShouldUseDarkColors = (shouldUseDarkColors: boolean) => {
    setShouldUseDarkColors(shouldUseDarkColors);
  };

  const handleSetShowFileTabs = () => {
    setShowFileTabs(prevShowFileTabs => !prevShowFileTabs);
  };

  const handleSetIsDrawerOpen = () => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen);
  };

  const handleSetIsSettingsOpen = () => {
    setIsSettingsOpen(prevIsSettingsOpen => !prevIsSettingsOpen);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    const filePath = event.dataTransfer.files[0].path;
    if(typeof filePath === 'string') ipcRenderer.send('droppedFile', filePath);
  };

  const handlePromptConfirm = (item: ContextMenuItem) => {
    const { id, todoObject, index } = item;
    switch (id) {
      case 'delete':
        ipcRenderer.send('removeLineFromFile', todoObject?.id);
        break;
      case 'removeFile':
        ipcRenderer.send('removeFile', index);
        break;
      default:
        setContextMenuItems(null);
    }
  };

  const handlePromptClose = () => {
    setPromptItem(null);
  };

  const handleDragOver = (event: Event) => {
    event.preventDefault();
  };

  const handleAlertClose = () => {
    setSnackBarContent(null);
    setSnackBarOpen(false);
  };

  const handleResponse = function (response: Error | string) {
    const severity = response instanceof Error ? 'error' : 'success';
    setSnackBarSeverity(severity);
    setSnackBarContent(response instanceof Error ? response.message : response);
  };

  const handleWriteTodoToFile = function (response: Error | string) {
    if(response instanceof Error) {
      handleResponse(response);
    } else {
      setDialogOpen(false);
    }
  };

  useEffect(() => {
    if(!headers) {
      return;
    } else if(headers.availableObjects === 0) {
      setSplashScreen('noTodosAvailable');
      setIsDrawerOpen(false);
    } else if(headers.visibleObjects === 0) {
      setSplashScreen('noTodosVisible');
    } else {
      setSplashScreen(null);
    }
  }, [headers]);

  useEffect(() => {
    if(files === null || files?.length === 0) {
      setTodoObjects(null);
      setHeaders(null);
      setSplashScreen('noFiles');
    } else {
      ipcRenderer.send('requestData');
    }
  }, [files]);

  useEffect(() => {
    store.set('sorting', sorting)
  }, [sorting]);

  useEffect(() => {
    store.set('isSearchOpen', isSearchOpen)
  }, [isSearchOpen]);

  useEffect(() => {
    setContextMenuItems(null);
  }, [promptItem]);

  useEffect(() => {
    store.set('isNavigationOpen', isNavigationOpen)
  }, [isNavigationOpen]);

  useEffect(() => {
    if(!snackBarContent) return;
    setSnackBarOpen(true);
  }, [snackBarContent]);

  useEffect(() => {
    if(!dialogOpen) {
      setTodoObject(null);
      setTextFieldValue('');
    }
  }, [dialogOpen]);

  useEffect(() => {
    store.set('zoom', zoom);
    const adjustedFontSize = 16 * (zoom / 100);
    document.body.style.fontSize = `${adjustedFontSize}px`;
  }, [zoom]);

  useEffect(() => {
    const anonymousUserId = store.get('anonymousUserId');
    if(matomo && anonymousUserId) {
      const matomoContainer: string = (environment === 'development') ? 'https://www.datenkrake.eu/matomo/js/container_WVsEueTV_dev_a003c77410fd43f247329b3b.js' : 'https://www.datenkrake.eu/matomo/js/container_WVsEueTV.js';
      const _mtm = window._mtm = window._mtm || [];
      _mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
      if(anonymousUserId) _mtm.push({'anonymousUserId': anonymousUserId });
      const
        d = document,
        g = d.createElement('script'),
        s = d.getElementsByTagName('script')[0];
      g.async = true;
      g.src = matomoContainer;
      s.parentNode.insertBefore(g, s);
    }
  }, [matomo]);

  useEffect(() => {
    ipcRenderer.on('requestData', handleRequestedData);
    ipcRenderer.on('updateFiles', handleUpdateFiles);
    ipcRenderer.on('updateSorting', handleUpdateSorting);
    ipcRenderer.on('setIsSearchOpen', handleSetIsSearchOpen);
    ipcRenderer.on('setIsNavigationOpen', handleSetIsNavigationOpen);
    ipcRenderer.on('setShouldUseDarkColors', handleSetShouldUseDarkColors);
    ipcRenderer.on('setShowFileTabs', handleSetShowFileTabs);
    ipcRenderer.on('setIsDrawerOpen', handleSetIsDrawerOpen);
    ipcRenderer.on('setIsSettingsOpen', handleSetIsSettingsOpen);
    ipcRenderer.on('matomo', (result) => setMatomo(result));
    ipcRenderer.on('writeTodoToFile', handleWriteTodoToFile);
    ipcRenderer.on('droppedFile', handleResponse);
    ipcRenderer.on('handleError', handleResponse);
    ipcRenderer.on('saveToClipboard', handleResponse);
    ipcRenderer.on('triggerArchiving', () => setTriggerArchiving(true));
    ipcRenderer.on('ArchivingResult', handleResponse);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
    ipcRenderer.off('requestData', handleRequestedData);
    ipcRenderer.off('updateFiles', handleUpdateFiles);
    ipcRenderer.off('updateSorting', handleUpdateSorting);
    ipcRenderer.off('setIsSearchOpen', handleSetIsSearchOpen);
    ipcRenderer.off('setIsNavigationOpen', handleSetIsNavigationOpen);
    ipcRenderer.off('setShouldUseDarkColors', handleSetShouldUseDarkColors);
    ipcRenderer.off('setShowFileTabs', handleSetShowFileTabs);
    ipcRenderer.off('setIsDrawerOpen', handleSetIsDrawerOpen);
    ipcRenderer.off('setIsSettingsOpen', handleSetIsSettingsOpen);
    ipcRenderer.off('matomo', (result: boolean) => setMatomo(result));
    ipcRenderer.off('writeTodoToFile', handleWriteTodoToFile);
    ipcRenderer.off('droppedFile', handleResponse);
    ipcRenderer.off('handleError', handleResponse);
    ipcRenderer.off('saveToClipboard', handleResponse);
    ipcRenderer.off('triggerArchiving', () => setTriggerArchiving(true));
    ipcRenderer.off('ArchivingResult', handleResponse);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={shouldUseDarkColors ? darkTheme : lightTheme}>
        <CssBaseline />
        <Box className={`flexContainer ${isNavigationOpen ? '' : 'hideNavigation'} ${shouldUseDarkColors ? 'darkTheme' : 'lightTheme'}`}>
          <NavigationComponent
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={setIsDrawerOpen}
            setDialogOpen={setDialogOpen}
            files={files}
            isNavigationOpen={isNavigationOpen}
            setIsNavigationOpen={setIsNavigationOpen}
            setIsSettingsOpen={setIsSettingsOpen}
            setTodoObject={setTodoObject}
            setTriggerArchiving={setTriggerArchiving}
            headers={headers}
          />
          {files?.length > 0 && (
            <>
              <DrawerComponent
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                attributes={attributes}
                filters={filters}
                sorting={sorting}
                setSorting={setSorting}
                attributeMapping={attributeMapping}
                searchFieldRef={searchFieldRef}
              />
            </>
          )}
          <Box className="flexItems">
            {files?.length > 0 && (
            <>
              {showFileTabs ?
              <FileTabs
                files={files}
                setContextMenuPosition={setContextMenuPosition}
                setContextMenuItems={setContextMenuItems}
               /> : null}
              {headers?.availableObjects > 0 ?
              <>
                <Search
                  headers={headers}
                  searchString={searchString}
                  setSearchString={setSearchString}
                  isSearchOpen={isSearchOpen}
                  setIsSearchOpen={setIsSearchOpen}
                  searchFieldRef={searchFieldRef}
                />
                <ToolBar
                  isSearchOpen={isSearchOpen}
                  setIsSearchOpen={setIsSearchOpen}
                  searchFieldRef={searchFieldRef}
                />
              </>
              : null }
            </>
            )}
            <TodoDataGrid
              flattenedTodoObjects={flattenedTodoObjects}
              setTodoObject={setTodoObject}
              attributes={attributes}
              filters={filters}
              setDialogOpen={setDialogOpen}
              contextMenuPosition={contextMenuPosition}
              setContextMenuPosition={setContextMenuPosition}
              contextMenuItems={contextMenuItems}
              setContextMenuItems={setContextMenuItems}
              setTextFieldValue={setTextFieldValue}
              setPromptItem={setPromptItem}
            />
            <SplashScreen
              screen={splashScreen}
              setDialogOpen={setDialogOpen}
              setSearchString={setSearchString}
            />
          </Box>
        </Box>
        <TodoDialog
          todoObject={todoObject}
          setTodoObject={setTodoObject}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          attributes={attributes}
          setSnackBarSeverity={setSnackBarSeverity}
          setSnackBarContent={setSnackBarContent}
          textFieldValue={textFieldValue}
          setTextFieldValue={setTextFieldValue}
          shouldUseDarkColors={shouldUseDarkColors}
        />
        <Settings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          setAttributeMapping={setAttributeMapping}
          zoom={zoom}
          setZoom={setZoom}
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
          onClose={handleAlertClose}
          autoHideDuration={3000}
        >
          <Alert
            severity={snackBarSeverity}
          >
            {snackBarContent}
          </Alert>
        </Snackbar>
        {files?.length > 0 && (
          <Archive
            setSnackBarSeverity={setSnackBarSeverity}
            setSnackBarContent={setSnackBarContent}
            triggerArchiving={triggerArchiving}
            setTriggerArchiving={setTriggerArchiving}
            showPromptDoneFile={showPromptDoneFile}
            setShowPromptDoneFile={setShowPromptDoneFile}
            headers={headers}
          />
        )}
        {promptItem && (
          <Prompt
            open={true}
            onClose={handlePromptClose}
            onConfirm={() => handlePromptConfirm(promptItem)}
            headline={promptItem.headline || ''}
            text={promptItem.text || ''}
            confirmButton={promptItem.label}
          />
        )}
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
