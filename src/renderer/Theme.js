import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: "0.65em"
  },
  typography: {
    fontFamily: [
      'FreeSans',
      'Helvetica',
      'Arial Unicode MS',
      'Arial',
      'Noto Sans',
      'DejaVu Sans',
      'Microsoft JhengHei',
      '微軟正黑體',
      'Microsoft YaHei',
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
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },    
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: '1em',
          boxShadow: 'none',
          color: '#5a5a5a',
          background: '#f0f0f0',
          '&:hover': {
            background: '#ebebeb',
            boxShadow: 'none',
          },
          '&:active': {
            background: '#ebebeb',
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

export default theme;
