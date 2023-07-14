import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Snackbar, Alert } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
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

const App: React.FC = () => {
  const [todoObjects, setTodoObjects] = useState<object>({});
  const [headers, setHeaders] = useState<object>({});
  const [attributes, setAttributes] = useState<object>({});
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [files, setFiles] = useState<object[]>([]);
  const [drawerParameter, setDrawerParameter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggleDrawer = (parameter: string | null = null) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen);
    setDrawerParameter(parameter);
  };

  const handleReceivedData = (todoObjects: object, attributes: any, headers: object) => {
    setHeaders(headers);
    setAttributes(attributes);
    setTodoObjects(todoObjects);
    setSplashScreen(null);
  };

  const handleShowSplashScreen = (screen: string, headers: object, attributes: object) => {
    setHeaders(headers);
    setAttributes(attributes);
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

  useEffect(() => {
    const responseHandler = function(response) {
      if (response instanceof Error) {
        setSnackBarSeverity('error');
        setSnackBarContent(response.message);
        setSnackBarOpen(true);
      } else {
        setDialogOpen(false);
      }
    }
    ipcRenderer.on('writeTodoToFile', responseHandler);

  }, []);  

  useEffect(() => {
    ipcRenderer.on('requestData', handleReceivedData);
    ipcRenderer.on('writeToConsole', handleWriteToConsole);
    ipcRenderer.on('showSplashScreen', handleShowSplashScreen);
    ipcRenderer.on('displayErrorFromMainProcess', handleDisplayError);
    ipcRenderer.send('requestData');
    const requestFiles = async () => {
      try {
        const files = await new Promise<object[]>((resolve, reject) => {
          ipcRenderer.once('requestFiles', resolve);
          ipcRenderer.send('requestFiles');
        });
        setFiles(files);
      } catch (error) {
        console.error(error);
      }
    };
    requestFiles();
    
    return () => {
      if (ipcRenderer && ipcRenderer.removeAllListeners) {
        ipcRenderer.removeAllListeners();
      }
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex-container">
        <DrawerComponent isOpen={isDrawerOpen} drawerParameter={drawerParameter} attributes={attributes} />
        <div className="flex-items">
          <FileTabs files={files} />
          <Search headers={headers} />
          <SplashScreen screen={splashScreen} />
          <TodoDataGrid todoObjects={todoObjects} attributes={attributes} setSnackBarOpen={setSnackBarOpen} />
        </div>
      </div>
      <NavigationComponent toggleDrawer={toggleDrawer} isOpen={isDrawerOpen} setDialogOpen={setDialogOpen} />
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
