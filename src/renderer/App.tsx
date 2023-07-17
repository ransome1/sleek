import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Snackbar, Alert } from '@mui/material';
import NavigationComponent from './Navigation';
import TodoDataGrid from './DataGrid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import theme from './Theme';
import DrawerComponent from './Drawer';
import Search from './Search';
import TodoDialog from './TodoDialog';
import './App.scss';

const ipcRenderer = window.electron.ipcRenderer;
const store = window.electron.store;

const App = () => {
  const [todoObjects, setTodoObjects] = useState<object>({});
  const [headers, setHeaders] = useState<object>({});
  const [filters, setFilters] = useState<object>({});
  const [attributes, setAttributes] = useState<object>({});
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>(store.get('files'));
  const [drawerParameter, setDrawerParameter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [fileTabs, setFileTabs] = useState<boolean>(true);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchString, setSearchString] = useState('');

  useEffect(() => {
    store.set('isDrawerOpen', isDrawerOpen);
  }, [isDrawerOpen]);

  useEffect(() => {
    store.set('files', files as File[] || []);
  }, [files]);

  useEffect(() => {
    const responseHandler = function(response) {
      if (response instanceof Error) {
        setSnackBarSeverity('error');
        setSnackBarContent(response.message);
        setSnackBarOpen(true);
      } else {
        setDialogOpen(false);
        console.log(response)
      }
    }
    ipcRenderer.on('writeTodoToFile', responseHandler);
  }, []);  

  useEffect(() => {
    ipcRenderer.on('setFile', handleSetFile);
    ipcRenderer.on('requestData', handleReceivedData);
    ipcRenderer.on('writeToConsole', handleWriteToConsole);
    ipcRenderer.on('showSplashScreen', handleShowSplashScreen);
    ipcRenderer.on('displayErrorFromMainProcess', handleDisplayError);
    ipcRenderer.send('requestData');
  }, []);  

  const toggleDrawer = (parameter: string | null = null) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen);
    setDrawerParameter(parameter);
  };

  const handleSetFile = (files: string[]) => {
    setFiles(files);
  };

  const handleReceivedData = (todoObjects: object, attributes: any, headers: object, filters: object) => {
    if(headers) setHeaders(headers);
    if(attributes) setAttributes(attributes);
    if(filters) setFilters(filters);
    setTodoObjects(todoObjects);
    setSplashScreen(null);
  };

  const handleShowSplashScreen = (screen: string, attributes: object, headers: object, filters: object) => {
    if(headers) setHeaders(headers);
    if(attributes) setAttributes(attributes);
    if(filters) setFilters(filters);
    setTodoObjects({});
    setSplashScreen(screen);
  };

  const handleWriteToConsole = (message: string) => {
    console.info(message);
  };

  const handleDisplayError = (error: string) => {
    console.error('Main process ' + error);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex-container">
        {files !== undefined && files.length > 0 && <DrawerComponent isDrawerOpen={isDrawerOpen} drawerParameter={drawerParameter} attributes={attributes} filters={filters} />}
        <div className="flex-items">
          {files !== undefined && files.length > 0 && <FileTabs files={files} />}
          {(files !== undefined && files.length > 0) && (headers.availableObjects > 0) && <Search headers={headers} setSearchString={setSearchString} searchString={searchString} />}
          <SplashScreen screen={splashScreen} setSearchString={setSearchString} setDialogOpen={setDialogOpen} />
          <TodoDataGrid todoObjects={todoObjects} attributes={attributes} setSnackBarOpen={setSnackBarOpen} filters={filters} />
        </div>
      </div>
      <NavigationComponent toggleDrawer={toggleDrawer} isDrawerOpen={isDrawerOpen} setDialogOpen={setDialogOpen} files={files} headers={headers} />
      {dialogOpen && <TodoDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} attributes={attributes} setSnackBarSeverity={setSnackBarSeverity} setSnackBarContent={setSnackBarContent} setSnackBarOpen={setSnackBarOpen} />}
      <Snackbar open={snackBarOpen} autoHideDuration={2000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackBarSeverity}>
          {snackBarContent}
        </Alert>
      </Snackbar>  
    </ThemeProvider>
  );
};

export default App;
