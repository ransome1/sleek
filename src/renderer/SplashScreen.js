import React from 'react';
import { Box } from '@mui/material';

const SplashScreen = ({ screen }) => {
  if(!screen) {
    return null;
  }
  
  return (
    <div data-testid="splashscreen-component">
      {console.log(screen)}
      {screen && <Box sx={{ display: 'block' }}>Splash Screen: {screen}</Box>}
    </div>
  );
};

export default SplashScreen;
