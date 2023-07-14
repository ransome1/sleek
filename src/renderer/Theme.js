import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: "0.65em"
  },
  typography: {
    fontFamily: 'FreeSans, sans-serif',
    color: 'red',
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          padding: ' 0 1em',
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '0 1em',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          border: 'none',
          cursor: 'pointer',          
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: '1em',
          boxShadow: 'none',
          padding: '1em',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
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
          borderRadius: '0.65em',
          color: '#5a5a5a',
          '&:hover': {
            background: 'none',
            boxShadow: 'none',
          },
          '&:active': {
            background: 'none',
            boxShadow: 'none',
          },
        }
      },
    },
  },
});

export default theme;
