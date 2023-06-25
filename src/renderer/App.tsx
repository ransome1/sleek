import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import TodoTxtDataGrid from './DataGrid.js';
import FileTabs from './FileTabs.js';
import DrawerComponent from './Drawer.js';

export const drawerWidth = 240;

export const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

export const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const useOpenState = () => {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
};

const App = () => {
  const [todoTxtObjects, setTodoTxtObjects] = useState(null);
  const [userPreferences, setuserPreferences] = useState(null);

  const [reloadGrid, setReloadGrid] = useState(false);
  const { open, setOpen } = useOpenState();

  const handleReloadGrid = () => {
    setReloadGrid(true);
  };

  useEffect(() => {
    const receiveTodoTxtObjects = (todoTxtObjects) => {
      setTodoTxtObjects(todoTxtObjects);
    };

    window.electron.ipcRenderer.on('receiveTodoTxtObjects', receiveTodoTxtObjects);

    
  }, [reloadGrid]);  

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {

  //       const receiveTodoTxtObjects = await new Promise((resolve, reject) => {
  //         window.electron.ipcRenderer.once('receiveTodoTxtObjects', resolve);
  //         window.electron.ipcRenderer.send('requestTodoTxtObjects');
  //       });

  //       setTodoTxtObjects(receiveTodoTxtObjects);
  //       setReloadGrid(false);

  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchData();
  // }, [reloadGrid]);

  // useEffect(() => {
  //   window.electron.ipcRenderer.on('reloadGrid', handleReloadGrid);
  //   return () => {
  //     window.electron.ipcRenderer.off('reloadGrid', handleReloadGrid);
  //   };
  // }, []);

  const theme = useTheme();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <FileTabs />
        </Toolbar>
      </StyledAppBar>
      <DrawerComponent open={open} setOpen={setOpen} handleDrawerClose={handleDrawerClose} />
      <TodoTxtDataGrid todoTxtObjects={todoTxtObjects} />
    </Box>
  );
};

export default App;
