import React from 'react';
import { Box } from '@mui/material';

const SplashScreen = ({ screen }) => {
  return (
    <div>
      {console.log(screen)}
      {screen && <Box sx={{ display: 'block' }}>Splash Screen: {screen}</Box>}
    </div>
  );
};

export default SplashScreen;
