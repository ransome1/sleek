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
  const [todoTxtObjects, setTodoTxtObjects] = useState<object>({});
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [files, setFiles] = useState<object[]>([]);

  const [drawerParameter, setDrawerParameter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const toggleDrawer = (parameter: string | null = null) => {
    setIsDrawerOpen(!isDrawerOpen);
    setDrawerParameter(parameter);
  };

  const receiveData = (todoTxtObjects: object) => {
    setSplashScreen(null);
    setTodoTxtObjects(todoTxtObjects);
  };

  const showSplashScreen = (screen: string) => {
    setTodoTxtObjects({});
    setSplashScreen(screen);
  };

  const writeToConsole = (message: string) => {
    console.info(message);
  };

  const displayError = (error: string) => {
    console.error('Main process ' + error);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('receiveTodos', receiveData);
    window.electron.ipcRenderer.on('writeToConsole', writeToConsole);
    window.electron.ipcRenderer.on('showSplashScreen', showSplashScreen);
    window.electron.ipcRenderer.on('displayErrorFromMainProcess', displayError);
    window.electron.ipcRenderer.send('requestData');

    const requestFiles = async () => {
      try {
        const files = await new Promise<object[]>((resolve, reject) => {
          window.electron.ipcRenderer.once('receiveFiles', resolve);
          window.electron.ipcRenderer.send('requestFiles');
        });
        setFiles(files);
      } catch (error) {
        console.error(error);
      }
    };
    requestFiles();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <div className="flex-container">
        <DrawerComponent isOpen={isDrawerOpen} drawerParameter={drawerParameter} />
        <div>
          <FileTabs files={files} />
          <Search todoTxtObjects={todoTxtObjects} />
          {splashScreen && (!todoTxtObjects || Object.keys(todoTxtObjects).length === 0) ? (
            <SplashScreen screen={splashScreen} />
          ) : (
            <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} />
          )} 
        </div>
      </div>
      <NavigationComponent toggleDrawer={toggleDrawer} />  
    </ThemeProvider>
  );
};

export default App;
