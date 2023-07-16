import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: "0.65em"
  },
  typography: {
    fontFamily: 'FreeSans, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          outline: 'none',
        },
        '&.Mui-focusVisible': {
          color: '#1976d2',
        },
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: '#f0f0f0',
        },        
        notchedOutline: {
          border: 'none',
        },
      }
    },    
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
          background: '#5a5a5a',
          color: '#fff',
          '&:hover': {
            color: '#fff',
            background: '#5a5a5a',
            boxShadow: 'none',
          },
          '&:active': {
            color: '#5a5a5a',
            background: '#ebebeb',
            boxShadow: 'none',
          },          
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
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '1.5em',
          border: 'none',
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
          minWidth: '2.5em',
          textTransform: 'none',
          fontSize: '1em',
          boxShadow: 'none',
          borderRadius: '0.65em',
          background: '#ebebeb',
          color: '#1976d2',
          '&:hover': {
            color: '#2d2d2d',
            background: '#ebebeb',
            boxShadow: 'none',
          },
          '&:active': {
            color: '#2d2d2d',
            background: '#ebebeb',
            boxShadow: 'none',
          },
        }
      },
      variants: [
        {
          props: { variant: 'contained' },
          style: {
            backgroundColor: '#1976d2',
            color: '#ffffff',
          },
        },
      ],      
    },
  },
});

export default theme;
