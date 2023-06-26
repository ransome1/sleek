import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import './Drawer.css';

const drawerWidth = 240;

const DrawerComponent = ({ isOpen }) => {
  return (
    <Drawer
      variant='persistent'
      anchor='left'
      open={isOpen}
      className='Drawer'
      sx={{
        transition: isOpen ? 'width 0.3s ease' : 'width 0.3s ease, margin-left 0.3s ease',
        width: isOpen ? drawerWidth : 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth
        },
      }}
    >
      <div style={{ width: drawerWidth }}>
        <List>
          <ListItem button>
            <ListItemText primary='Item 1' />
          </ListItem>
          <ListItem button>
            <ListItemText primary='Item 2' />
          </ListItem>
          <ListItem button>
            <ListItemText primary='Item 3' />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default DrawerComponent;
