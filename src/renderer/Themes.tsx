import { createTheme, Theme } from "@mui/material/styles";

const { store } = window.api;

const disableAnimations = store.getConfig("disableAnimations");

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
          "&.Mui-focused": {
            color: "#1976d2",
          },
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
          "&:focus-visible": {
            background: "#2d2d2d",
            outline: "none;",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "#2d2d2d",
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
          "&.Mui-focusVisible": {
            backgroundColor: "#2d2d2d",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "white",
          "&.Mui-checked": {
            color: "#1976d2",
          },
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
          "&.Mui-focusVisible svg": {
            color: "white",
          },
          "&.Mui-checked.Mui-focusVisible svg": {
            color: "white",
          },
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
        },
        notchedOutline: {
          border: "none",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&:focus-visible": {
            background: "#f0f0f0",
            outline: "none;",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#1976d2",
          },
          "&.Mui-focusVisible": {
            backgroundColor: "#ccc",
          },
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
          "&.Mui-focusVisible svg": {
            color: "#5a5a5a",
          },
          "&.Mui-checked.Mui-focusVisible svg": {
            color: "5a5a5a",
          },
        },
      },
    },
  },
});

export { dark, light };
