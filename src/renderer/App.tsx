import React, { useEffect, useState, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert, Box } from '@mui/material';
import NavigationComponent from './Navigation';
import TodoDataGrid from './DataGrid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import { baseTheme, darkTheme, lightTheme } from './Themes';
import DrawerComponent from './Drawer';
import Search from './Search';
import TodoDialog from './TodoDialog';
import ArchiveTodos from './ArchiveTodos';
import ToolBar from './ToolBar';
import ContextMenu from './ContextMenu';
import { Sorting } from '../main/util';
import './App.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const App = () => {
  const [files, setFiles] = useState<string[]>(store.get('files') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(store.get('isDrawerOpen') || false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(store.get('isSearchOpen') || false);
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [searchString, setSearchString] = useState(null);
  const [todoObjects, setTodoObjects] = useState<object>(null);
  const [todoObject, setTodoObject] = useState(null);
  const [headers, setHeaders] = useState<object>(null);
  const [filters, setFilters] = useState<object>({});
  const [attributes, setAttributes] = useState<object>({});
  const [textFieldValue, setTextFieldValue] = useState('');
  const [sorting, setSorting] = useState<Sorting>(store.get('sorting') || null);
  const searchFieldRef = useRef(null);
  const [isNavigationOpen, setIsNavigationOpen] = useState<boolean>(store.get('isNavigationOpen'));
  const [colorTheme, setColorTheme] = useState<boolean>(store.get('colorTheme') || 'system');
  const [shouldUseDarkColors, setShouldUseDarkColors] = useState<boolean>(store.get('shouldUseDarkColors') || false);
  const [showFileTabs, setShowFileTabs] = useState<boolean>(store.get('showFileTabs'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [contextMenuItems, setContextMenuItems] = useState([]);
  
  const responseHandler = function(response) {
    if (response instanceof Error) {
      setSnackBarSeverity('error');
      setSnackBarContent(response.message);
      setSnackBarOpen(true);
      console.error(response)
    } else {
      setDialogOpen(false);
      console.log(response)
    }
  }
  
  const handleRequestedData = (todoObjects: object, attributes: object, headers: object, filters: object) => {
    if(headers) setHeaders(headers);
    if(attributes) setAttributes(attributes);
    if(filters) setFilters(filters);
    if(todoObjects) setTodoObjects(todoObjects);
    setSplashScreen(null);
  };

  const handleUpdateFiles = (files: object) => {
    setFiles(files);
  };

  const handleUpdateSorting = (sorting: object) => {
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
    setColorTheme((shouldUseDarkColors) ? 'dark' : 'light');
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

  const handleDrop = (event) => {
    event.preventDefault();
    const filePath = event.dataTransfer.files[0].path;
    if(typeof filePath === 'string') ipcRenderer.send('addFile', filePath);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    if(!headers) return;
    if (headers.availableObjects === 0) {
      setSplashScreen('noTodosAvailable');
      setIsDrawerOpen(false);
    } else if (headers.visibleObjects === 0) {
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
    store.set('isDrawerOpen', isDrawerOpen)
  }, [isDrawerOpen]);

  useEffect(() => {
    store.set('isSearchOpen', isSearchOpen)
  }, [isSearchOpen]);

  useEffect(() => {
    store.set('', isNavigationOpen)
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
    ipcRenderer.on('writeTodoToFile', responseHandler);
    ipcRenderer.on('requestData', handleRequestedData);
    ipcRenderer.on('updateFiles', handleUpdateFiles);
    ipcRenderer.on('updateSorting', handleUpdateSorting);
    ipcRenderer.on('setIsSearchOpen', handleSetIsSearchOpen);
    ipcRenderer.on('setIsNavigationOpen', handleSetIsNavigationOpen);
    ipcRenderer.on('setShouldUseDarkColors', handleSetShouldUseDarkColors);
    ipcRenderer.on('setShowFileTabs', handleSetShowFileTabs);
    ipcRenderer.on('setIsDrawerOpen', handleSetIsDrawerOpen);
    ipcRenderer.on('setIsSettingsOpen', handleSetIsSettingsOpen);
    ipcRenderer.on('saveToClipboard', responseHandler);
    
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);

    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };    
  }, []);

  return (
    <ThemeProvider theme={shouldUseDarkColors ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
          className={`flexContainer ${isNavigationOpen ? '' : 'hideNavigation'} ${
            shouldUseDarkColors ? 'darkTheme' : 'lightTheme'
          }`}  
        >
        <NavigationComponent
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          setDialogOpen={setDialogOpen}
          files={files}
          headers={headers}
          isNavigationOpen={isNavigationOpen}
          setIsNavigationOpen={setIsNavigationOpen}
          colorTheme={colorTheme}
          setColorTheme={setColorTheme}
          showFileTabs={showFileTabs}
          setShowFileTabs={setShowFileTabs}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
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
            />
          </>
        )}
        <Box className="flexItems">
          {files?.length > 0 && (
          <>
            {!isSearchOpen && showFileTabs ? <FileTabs 
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
            todoObjects={todoObjects}
            setTodoObject={setTodoObject}
            attributes={attributes}
            filters={filters}
            setSnackBarSeverity={setSnackBarSeverity}
            setSnackBarContent={setSnackBarContent}
            setDialogOpen={setDialogOpen}
            setTextFieldValue={setTextFieldValue}
            contextMenuPosition={contextMenuPosition}
            setContextMenuPosition={setContextMenuPosition}
            contextMenuItems={contextMenuItems}
            setContextMenuItems={setContextMenuItems}
          />
          <SplashScreen 
            screen={splashScreen}
            setDialogOpen={setDialogOpen}
            setSearchString={setSearchString}
          />
        </Box>
      </Box>
      <TodoDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        todoObject={todoObject}
        attributes={attributes}
        setSnackBarSeverity={setSnackBarSeverity}
        setSnackBarContent={setSnackBarContent}
        textFieldValue={textFieldValue}
        setTextFieldValue={setTextFieldValue}
        shouldUseDarkColors={shouldUseDarkColors}
      />
      <ContextMenu
        contextMenuPosition={contextMenuPosition}
        setContextMenuPosition={setContextMenuPosition}
        contextMenuItems={contextMenuItems}
        setContextMenuItems={setContextMenuItems}        
      />
      <Snackbar 
        open={snackBarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackBarOpen(false)}
      >
        <Alert
          severity={snackBarSeverity}
          onClose={() => setSnackBarOpen(false)}
        >
          {snackBarContent}
        </Alert>
      </Snackbar>
      <ArchiveTodos />
    </ThemeProvider>
  );
};

export default App;