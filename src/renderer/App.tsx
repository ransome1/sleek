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
  const [searchString, setSearchString] = useState('');

  const [drawerParameter, setDrawerParameter] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const toggleDrawer = (parameter: string | null = null) => {
    setIsDrawerOpen(prevIsDrawerOpen => !prevIsDrawerOpen);
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

  const handleSearchChange = (searchString: string) => {
    setSearchString(searchString);
  };

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer;

    ipcRenderer.on('receiveTodos', receiveData);
    ipcRenderer.on('writeToConsole', writeToConsole);
    ipcRenderer.on('showSplashScreen', showSplashScreen);
    ipcRenderer.on('displayErrorFromMainProcess', displayError);
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

  const renderContent = () => {
    if (splashScreen && (!todoTxtObjects || Object.keys(todoTxtObjects).length === 0)) {
      return <SplashScreen screen={splashScreen} />;
    } else {
      return <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} searchString={searchString} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex-container">
        <DrawerComponent isOpen={isDrawerOpen} drawerParameter={drawerParameter} />
        <div className="flex-items">
          <FileTabs files={files} />
          <Search todoTxtObjects={todoTxtObjects} handleSearchChange={handleSearchChange} />
          {renderContent()}
        </div>
      </div>
      <NavigationComponent toggleDrawer={toggleDrawer} />
    </ThemeProvider>
  );
};

export default App;
