import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          background: 'transparent',
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
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '0',
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
          '&:hover': {
            boxShadow: 'none',
          },
          '&:active': {
            boxShadow: 'none',
          },
          '&:focus': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            color: '#5a5a5a',
            background: '#ccc',
          },             
        }
      },
      variants: [
        {
          props: { variant: 'contained' },
        },
      ],      
    },    
  }  
});

const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    background: {
      default: '#212224',
      paper: '#3B3B3B', // Set the background color for paper elements (e.g., cards)
    },
  },  
});

const lightTheme = createTheme({
  ...baseTheme,  
});

export { darkTheme, lightTheme };