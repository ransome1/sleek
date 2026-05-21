import { createTheme, Theme } from "@mui/material/styles";
import colors from "./Colors";

const { store } = window.api;

const disableAnimations = store.getConfig("disableAnimations");

// Border radius constant - used in SCSS via CSS variable
export const BORDER_RADIUS = "0.65em";

const focusStyle = {
  outline: `2px solid ${colors.semantic.primary}`,
  outlineOffset: "-2px",
};

const baseTheme: Theme = createTheme({
  ...(disableAnimations && { transitions: { create: () => "none" } }),
  shape: {
    borderRadius: BORDER_RADIUS,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {},
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
          backgroundColor: colors.light.surfaceVariant,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          svg: {
            color: colors.semantic.primary,
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
          backgroundColor: colors.semantic.primary,
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
      default: colors.dark.background,
      paper: colors.dark.surface,
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
          backgroundColor: colors.dark.background,
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          ".modal": {
            background: colors.dark.surface,
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
          background: colors.dark.surfaceVariant,
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
            color: colors.semantic.primary,
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
          color: colors.semantic.primary,
          "&.Mui-checked": {
            color: colors.semantic.primary,
          },
          "&.Mui-focusVisible": focusStyle,
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
          backgroundColor: colors.light.surfaceVariant,
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          ".modal": {
            background: colors.light.background,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: colors.light.surface,
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
            color: colors.semantic.primary,
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
          color: colors.semantic.primary,
          "&.Mui-checked": {
            color: colors.semantic.primary,
          },
          "&.Mui-focusVisible": focusStyle,
        },
      },
    },
  },
});

export { dark, light };
