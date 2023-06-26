import React, { useEffect, useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import NavigationComponent from './Navigation';
import DrawerComponent from './Drawer';
import TodoTxtDataGrid from './DataGrid';
import SplashScreen from './SplashScreen';
import FileTabs from './FileTabs';
import './App.css';

const App = () => {
  const [todoTxtObjects, setTodoTxtObjects] = useState(null);
  const [splashScreen, setSplashScreen] = useState('Splash Screen Content'); // Set the initial value for splashScreen

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const receiveTodoTxtObjects = (todoTxtObjects) => {
    setSplashScreen(null);
    setTodoTxtObjects(todoTxtObjects);
  };

  const showSplashScreen = (screen) => {
    setTodoTxtObjects(null);
    setSplashScreen(screen);
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('receiveTodoTxtObjects', receiveTodoTxtObjects);
    window.electron.ipcRenderer.on('showSplashScreen', showSplashScreen);
    window.electron.ipcRenderer.send('requestTodoTxtObjects');
  }, []);

  return (
    <Box className="wrapper1">
      <CssBaseline />

      <NavigationComponent toggleDrawer={toggleDrawer} />

      <Box className="wrapper2">
        <DrawerComponent isOpen={isDrawerOpen} />
        <Box className="wrapper3">
          <FileTabs />
          <Box
            className="DataGrid"
            style={{ width: `calc(100vw - ${5 * parseFloat(getComputedStyle(document.documentElement).fontSize)}px)` }}
          >
            {todoTxtObjects !== null && <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} />}
            {splashScreen !== null && <SplashScreen screen={splashScreen} />} {/* Pass the splashScreen value as a prop */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default App;
