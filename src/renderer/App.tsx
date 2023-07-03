import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import NavigationComponent from './Navigation';
import TodoTxtDataGrid from './DataGrid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import theme from './Theme';
import DrawerComponent from './Drawer';
import Search from './Search';
import './App.scss';

const App: React.FC = () => {
  const [todoObjects, setTodoTxtObjects] = useState<object>({});
  const [headers, setHeaders] = useState<object>({});
  const [filters, setFilters] = useState<object>({});
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [files, setFiles] = useState<object[]>([]);
  const [drawerParameter, setDrawerParameter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (parameter: string | null = null) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen);
    setDrawerParameter(parameter);
  };

  const handleReceiveData = (todoObjects: object, filters: any, headers: object) => {
    setHeaders(headers);
    setFilters(filters);
    setTodoTxtObjects(todoObjects);
    setSplashScreen(null);
  };

  const handleShowSplashScreen = (screen: string, headers: object) => {
    setHeaders(headers);
    setFilters(filters);
    setTodoTxtObjects({});
    setSplashScreen(screen);
  };

  const handleWriteToConsole = (message: string) => {
    console.info(message);
  };

  const handleDisplayError = (error: string) => {
    console.error('Main process ' + error);
  };

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;
    ipcRenderer.on('receiveData', handleReceiveData);
    ipcRenderer.on('writeToConsole', handleWriteToConsole);
    ipcRenderer.on('showSplashScreen', handleShowSplashScreen);
    ipcRenderer.on('displayErrorFromMainProcess', handleDisplayError);
    ipcRenderer.send('requestData');
    const requestFiles = async () => {
      try {
        const files = await new Promise<object[]>((resolve, reject) => {
          ipcRenderer.once('receiveFiles', resolve);
          ipcRenderer.send('requestFiles');
        });
        setFiles(files);
      } catch (error) {
        console.error(error);
      }
    };
    requestFiles();
    return () => {
      ipcRenderer.removeAllListeners();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex-container">
        <DrawerComponent isOpen={isDrawerOpen} drawerParameter={drawerParameter} filters={filters} />
        <div className="flex-items">
          <FileTabs files={files} />
          <Search headers={headers} />
          <SplashScreen screen={splashScreen} />
          <TodoTxtDataGrid todoObjects={todoObjects} />
        </div>
      </div>
      <NavigationComponent toggleDrawer={toggleDrawer} isOpen={isDrawerOpen} />
    </ThemeProvider>
  );
};

export default App;
