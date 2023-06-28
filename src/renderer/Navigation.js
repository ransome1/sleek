import React from 'react';
import './Navigation.css';

const NavigationComponent = ({ toggleDrawer }) => {
  return (
    <nav data-testid='navigation-component'>
      <button data-testid='toggle-drawer' onClick={toggleDrawer}>Toggle Drawer</button>
      {/* Additional app bar content */}
    </nav>
  );
};

export default NavigationComponent;
