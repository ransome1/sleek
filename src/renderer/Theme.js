import { createTheme } from '@mui/material/styles';

const theme = createTheme({
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
    MuiInput: {
      styleOverrides: {
        root: {
          borderRadius: '.65em',
          background: '#ebebeb',
          padding: '.5em .75em',
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
