import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faSlidersH, faFolderOpen, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import TodoDialog from './TodoDialog';
import './Navigation.css';

const NavigationComponent = ({ toggleDrawer }) => {

  const [dialogOpen, setDialogOpen] = useState(false);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  return (
    <nav data-testid='navigation-component'>
      {dialogOpen && <TodoDialog setDialogOpen={setDialogOpen} />}
      <Box>sleek</Box>
      <Button data-testid='navigation-button-add' onClick={openAddTodoDialog}><FontAwesomeIcon data-testid='fa-icon-plus' icon={faPlus} /></Button>
      <Button data-testid='navigation-button-filter' onClick={toggleDrawer}><FontAwesomeIcon data-testid='fa-icon-filter' icon={faFilter} /></Button>
      <Button data-testid='navigation-button-view' onClick={toggleDrawer}><FontAwesomeIcon data-testid='fa-icon-slider-h' icon={faSlidersH} /></Button>
      <Button data-testid='navigation-button-files'><FontAwesomeIcon data-testid='fa-icon-folder-open' icon={faFolderOpen} /></Button>
      <Button data-testid='navigation-button-settings' className='bottom'><FontAwesomeIcon data-testid='fa-icon-cog' icon={faCog} /></Button>
      <Button data-testid='navigation-button-help'><FontAwesomeIcon data-testid='fa-icon-question-circle' icon={faQuestionCircle} /></Button>
    </nav>
  );
};

export default NavigationComponent;
