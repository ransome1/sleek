import React from 'react';
import { Button, Box } from '@mui/material';
import './SplashScreen.scss';

const SplashScreen = ({ screen }) => {
  if (!screen) {
    return null;
  }
  return (
    <Box className="splashScreen" data-testid="splashscreen-component">
      {screen === "notodoObjects" && (
        <>
          <h1>No results</h1>
          <p>No results found for either your search input nor your selected filters</p>
          <Button variant="filled" data-testid='navigation-button-files'>
            Reset filters and search
          </Button>
        </>
      )}
    </Box>
  );
};

export default SplashScreen;
