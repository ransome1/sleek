import React from 'react';
import './Navigation.css';

const NavigationComponent = ({ toggleDrawer }) => {
  return (
    <nav>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
      {/* Additional app bar content */}
    </nav>
  );
};

export default NavigationComponent;
