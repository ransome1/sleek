import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: "0.65em"
  },
  typography: {
    fontFamily: [
      'FreeSans',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          background: 'transparent',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          background: '#ebebeb',
          border: '0',
        },
      },
    },    
    MuiDialog: {
      styleOverrides: {
        root: {
          
        },
        paper: {
          width: '100vw',
          maxWidth: '50em',
          borderRadius: '1em',
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'auto',
          height: 'auto',
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },    
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1em',
          boxShadow: 'none',
          color: '#5a5a5a',
          '&:hover': {
            background: '#ebebeb',
            boxShadow: 'none',
          },
          '&:active': {
            background: '#ebebeb',
            boxShadow: 'none',
          },
        },
        filled: {
          background: '#ebebeb',
        },
      },
    },
  },
});

export default theme;
