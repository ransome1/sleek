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
const sorting = store.get('sorting');

const App = () => {
  const [files, setFiles] = useState<string[]>(store.get('files') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [drawerParameter, setDrawerParameter] = useState<string | null>();
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [fileTabs, setFileTabs] = useState<boolean>(true);
  const [snackBarContent, setSnackBarContent] = useState<string | null>(null);
  const [snackBarSeverity, setSnackBarSeverity] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [todoObject, setTodoObject] = useState(null);
  const [searchString, setSearchString] = useState(null);
  const [todoObjects, setTodoObjects] = useState<object>(null);
  const [headers, setHeaders] = useState<object>(null);
  const [filters, setFilters] = useState<object>({});
  const [attributes, setAttributes] = useState<object>({});
  const [textFieldValue, setTextFieldValue] = useState('');
  
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
  
  const handleRequestedData = (todoObjects: object, attributes: any, headers: object, filters: object) => {
    if(todoObjects) setTodoObjects(todoObjects);
    if(attributes) setAttributes(attributes);
    if(headers) setHeaders(headers);
    if(filters) setFilters(filters);
    setSplashScreen(null);
  };

  const handleUpdateFiles = (files: object) => {
    setFiles(files)
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
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex-container">
        <NavigationComponent
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          drawerParameter={drawerParameter}
          setDrawerParameter={setDrawerParameter}
          setDialogOpen={setDialogOpen}
          files={files}
          headers={headers}
        />
        <DrawerComponent 
          isDrawerOpen={isDrawerOpen}
          setIsDrawerOpen={setIsDrawerOpen}
          drawerParameter={drawerParameter}
          attributes={attributes}
          filters={filters}
        />
        <div className="flex-items">
          <FileTabs files={files} />
          <Search
            headers={headers}
            searchString={searchString}
            setSearchString={setSearchString}
          />
          <TodoDataGrid 
            todoObjects={todoObjects}
            todoObject={todoObject}
            setTodoObject={setTodoObject}
            attributes={attributes}
            filters={filters}
            setSnackBarSeverity={setSnackBarSeverity}
            setSnackBarContent={setSnackBarContent}
            setDialogOpen={setDialogOpen}
            setTextFieldValue={setTextFieldValue}
            sorting={sorting}
          />
          <SplashScreen 
            screen={splashScreen}
            setDialogOpen={setDialogOpen}
            setSearchString={setSearchString}
          />
        </div>
      </div>
      <TodoDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        todoObject={todoObject}
        attributes={attributes}
        setSnackBarSeverity={setSnackBarSeverity}
        setSnackBarContent={setSnackBarContent}
        textFieldValue={textFieldValue}
        setTextFieldValue={setTextFieldValue}
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
    </ThemeProvider>
  );
};

export default App;
