import { createTheme, Theme } from "@mui/material/styles";

const { store } = window.api;

const disableAnimations = store.getConfig("disableAnimations");

const focusStyle = {
  outline: "2px solid #1976d2",
  outlineOffset: "-2px",
};

;

const baseTheme: Theme = createTheme({
  ...(disableAnimations && { transitions: { create: () => "none" } }),
  shape: {
    borderRadius: "0.65em",
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          background: "none",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ebebeb",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          svg: {
            color: "#1976d2",
            marginLeft: "0.3em",
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        root: {
          border: "none",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "auto",
        },
        indicator: {
          backgroundColor: "#1976d2",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": {
            outline: "none",
          },
        },
        paper: {
          backgroundImage: "none",
        },
      },
    },
  },
});

const dark: Theme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    background: {
      default: "#212224",
      paper: "#3B3B3B",
    },
  },
  components: {
    ...baseTheme.components,
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: "#212224",
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          ".modal": {
            background: "#3B3B3B",
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&:focus-visible": focusStyle,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "#2d2d2d",
          "&:focus-visible": focusStyle,
        },
        notchedOutline: {
          border: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#1976d2",
          },
          "&.Mui-focusVisible": focusStyle,
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          "&:focus-within": focusStyle,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#1976d2",
          "&.Mui-checked": {
            color: "#1976d2",
          },
          "&.Mui-focusVisible": focusStyle
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": focusStyle,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": focusStyle,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "&.Mui-focusVisible": focusStyle,
        },
      },
    },
  },
});

const light: Theme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
  },
  components: {
    ...baseTheme.components,
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
          backgroundColor: "#ebebeb",
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          ".modal": {
            background: "#fff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "#f0f0f0",
          "&:focus-visible": focusStyle,
        },
        notchedOutline: {
          border: "none",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&:focus-visible": focusStyle,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#1976d2",
          },
          "&.Mui-focusVisible": focusStyle,
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          "&:focus-within": focusStyle,
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#1976d2",
          "&.Mui-checked": {
            color: "#1976d2",
          },
          "&.Mui-focusVisible": focusStyle
        },
      },
    },
  },
});

export { dark, light };
