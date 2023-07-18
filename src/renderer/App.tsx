import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
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
  const [todoObjects, setTodoObjects] = useState<object>();
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [headers, setHeaders] = useState<object>({});
  const [filters, setFilters] = useState<object>({});
  const [attributes, setAttributes] = useState<object>({});
  const [files, setFiles] = useState<string[]>(store.get('files'));
  const [drawerParameter, setDrawerParameter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(store.get('isDrawerOpen') | false);
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [fileTabs, setFileTabs] = useState<boolean>(true);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchString, setSearchString] = useState('');

  const toggleDrawer = (parameter: string | null = null) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen);
    setDrawerParameter(parameter);
  };

  const handleReceivedData = (todoObjects: object, attributes: any, headers: object, filters: object, files: object) => {
    if(headers) setHeaders(headers);
    if(attributes) setAttributes(attributes);
    if(filters) setFilters(filters);
    if(files) setFiles(files);
    if(todoObjects) setTodoObjects(todoObjects);
    setSplashScreen(null);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackBarOpen(false);
  };

  useEffect(() => {
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
    store.set('isDrawerOpen', isDrawerOpen);
  }, [isDrawerOpen]);


  useEffect(() => {
    if(!files || files.length === 0) {
      setSplashScreen('noFiles');
    }
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
    ipcRenderer.on('requestData', handleReceivedData);
    ipcRenderer.send('requestData');
  }, []);  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex-container">
        <DrawerComponent isDrawerOpen={isDrawerOpen} drawerParameter={drawerParameter} attributes={attributes} filters={filters} />
        <div className="flex-items">
          {files && files.length > 0 && (
            <>
              <FileTabs files={files} />
              <Search headers={headers} searchString={searchString} setSearchString={setSearchString} />
              <TodoDataGrid todoObjects={todoObjects} attributes={attributes} setSnackBarOpen={setSnackBarOpen} filters={filters} />
            </>
          )}
          <SplashScreen screen={splashScreen} setDialogOpen={setDialogOpen} setSearchString={setSearchString} />
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
