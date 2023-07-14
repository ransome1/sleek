import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faSlidersH, faFolderOpen, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Box } from '@mui/material';
import './Navigation.scss';

const NavigationComponent = ({ toggleDrawer, isOpen, setDialogOpen }) => {
  const [activeButton, setActiveButton] = useState(null);

  const openAddTodoDialog = () => {
    setDialogOpen(true);
  };

  const handleButtonClicked = (parameter) => {
    toggleDrawer(parameter);
    setActiveButton(parameter);
  };

  return (
    <nav data-testid='navigation-component'>
      <Box>sleek</Box>
      <Button onClick={openAddTodoDialog} className={activeButton === 'add' ? 'active' : ''}>
        <FontAwesomeIcon icon={faPlus} />
      </Button>
      <Button onClick={() => handleButtonClicked('filter')} className={isOpen && activeButton === 'filter' ? 'active' : ''}>
        <FontAwesomeIcon icon={faFilter} />
      </Button>
      <Button onClick={() => handleButtonClicked('view')} className={isOpen && activeButton === 'view' ? 'active' : ''}>
        <FontAwesomeIcon icon={faSlidersH} />
      </Button>
      <Button>
        <FontAwesomeIcon icon={faFolderOpen} />
      </Button>
      <Button>
        <FontAwesomeIcon icon={faCog} />
      </Button>
      <Button>
        <FontAwesomeIcon icon={faQuestionCircle} />
      </Button>
    </nav>
  );
};

export default NavigationComponent;
