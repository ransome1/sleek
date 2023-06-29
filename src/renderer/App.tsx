import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import NavigationComponent from './Navigation';
import DrawerComponent from './Drawer';
import TodoTxtDataGrid from './DataGrid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import theme from './Theme';
import './App.css';

const App: React.FC = () => {
  const [todoTxtObjects, setTodoTxtObjects] = useState<object>({});
  const [splashScreen, setSplashScreen] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [files, setFiles] = useState<object[]>([]);

  const toggleDrawer: any = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const receiveTodoTxtObjects = (todoTxtObjects: any) => {
    setSplashScreen(null);
    setTodoTxtObjects(todoTxtObjects);
  };

  const showSplashScreen = (screen: string) => {
    setTodoTxtObjects({});
    setSplashScreen(screen);
  };

  const displayError = (error: string) => {
    console.error('Main process ' + error);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('receiveTodoTxtObjects', receiveTodoTxtObjects);
    window.electron.ipcRenderer.on('showSplashScreen', showSplashScreen as (...args: unknown[]) => void);
    window.electron.ipcRenderer.on('displayErrorFromMainProcess', displayError as (...args: unknown[]) => void);
    window.electron.ipcRenderer.send('requestTodoTxtObjects');

    const requestFiles = async () => {
      try {
        const files = await new Promise<object[]>((resolve, reject) => {
          window.electron.ipcRenderer.once('receiveFiles', resolve as (...args: unknown[]) => void);
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
      <Box className="wrapper1">
        <CssBaseline />
        <NavigationComponent toggleDrawer={toggleDrawer} />
        <Box className="wrapper2">
          <DrawerComponent isOpen={isDrawerOpen} />
          <Box className="wrapper3">
            <FileTabs files={files} />
            <Box
              className="Content"
              style={{ width: `calc(100vw - ${5 * parseFloat(getComputedStyle(document.documentElement).fontSize)}px)` }}
            >
              {splashScreen && (!todoTxtObjects || Object.keys(todoTxtObjects).length === 0) ? (
                <SplashScreen screen={splashScreen} />
              ) : (
                <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
