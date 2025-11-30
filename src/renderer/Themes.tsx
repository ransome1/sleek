import { createTheme, Theme } from '@mui/material/styles'

const { store } = window.api

const disableAnimations = store.getConfig('disableAnimations')

// Modern color palette
const colors = {
  // Light mode
  light: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    background: '#ffffff',
    backgroundSecondary: '#f1f5f9',
    paper: '#ffffff',
    drawer: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    hover: '#f1f5f9',
    focus: '#e2e8f0',
    input: '#f1f5f9'
  },
  // Dark mode - modern deep blue-gray
  dark: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    paper: '#1e293b',
    drawer: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    border: '#334155',
    hover: '#334155',
    focus: '#334155',
    input: '#334155'
  }
}

// Shared transition config
const transitionConfig = disableAnimations
  ? { create: () => 'none' }
  : {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    }

const baseTheme: Theme = createTheme({
  transitions: transitionConfig,
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em'
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em'
    },
    body1: {
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    }
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: false
      },
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:active': {
            transform: 'scale(0.98)'
          }
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: colors.light.primary
          }
        }
      }
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: 'transparent',
          '&:before': {
            display: 'none'
          },
          '&.Mui-expanded': {
            margin: 0
          }
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: '48px',
          '&.Mui-expanded': {
            minHeight: '48px'
          }
        },
        content: {
          '&.Mui-expanded': {
            margin: '12px 0'
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
          marginTop: '4px'
        },
        listbox: {
          padding: '8px'
        },
        option: {
          borderRadius: '8px',
          margin: '2px 0',
          '&:hover': {
            backgroundColor: colors.light.hover
          }
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colors.light.primary,
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          '&:hover': {
            color: colors.light.primaryDark
          },
          svg: {
            color: colors.light.primary,
            marginLeft: '0.3em'
          }
        }
      }
    },
    MuiBadge: {
      styleOverrides: {
        root: {
          border: 'none'
        },
        badge: {
          fontWeight: 600,
          fontSize: '0.7rem'
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'auto'
        },
        indicator: {
          backgroundColor: colors.light.primary,
          height: '3px',
          borderRadius: '3px 3px 0 0'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            fontWeight: 600
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: 'none'
          }
        },
        paper: {
          backgroundImage: 'none',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        },
        arrow: {
          color: 'rgba(15, 23, 42, 0.95)'
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)'
          }
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)'
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: '9999px',
          transition: 'all 0.2s ease'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.light.border
        }
      }
    }
  }
})

const dark: Theme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: colors.dark.primary,
      dark: colors.dark.primaryDark,
      light: colors.dark.primaryLight
    },
    background: {
      default: colors.dark.background,
      paper: colors.dark.paper
    },
    text: {
      primary: colors.dark.text,
      secondary: colors.dark.textSecondary
    }
  },
  components: {
    ...baseTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.dark.background,
          color: colors.dark.text
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundColor: colors.dark.drawer,
          backdropFilter: 'blur(12px)',
          backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))'
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.dark.paper,
          backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.98), rgba(30, 41, 59, 0.95))',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${colors.dark.border}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        },
        option: {
          '&:hover': {
            backgroundColor: colors.dark.hover
          },
          '&.Mui-focused': {
            backgroundColor: colors.dark.focus
          }
        }
      }
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '.modal': {
            background: colors.dark.paper,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${colors.dark.border}`
          }
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            background: colors.dark.focus,
            outline: 'none'
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: colors.dark.input,
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: colors.dark.hover
          },
          '&.Mui-focused': {
            background: colors.dark.input,
            boxShadow: `0 0 0 2px ${colors.dark.primary}40`
          }
        },
        notchedOutline: {
          border: 'none'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: colors.dark.textSecondary,
          '&.Mui-selected': {
            color: colors.dark.primary
          },
          '&.Mui-focusVisible': {
            backgroundColor: colors.dark.focus
          }
        }
      }
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.dark.textSecondary,
          '&.Mui-checked': {
            color: colors.dark.primary
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.dark.primary,
          '&.Mui-checked': {
            color: colors.dark.primary
          },
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.12)'
          },
          '&.Mui-focusVisible svg': {
            color: colors.dark.text
          },
          '&.Mui-checked.Mui-focusVisible svg': {
            color: colors.dark.text
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.dark.paper,
          backgroundImage: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.98), rgba(30, 41, 59, 0.95))',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${colors.dark.border}`
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.dark.border
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.12)'
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          color: '#1e293b',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        },
        arrow: {
          color: 'rgba(248, 250, 252, 0.95)'
        }
      }
    }
  }
})

const light: Theme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: colors.light.primary,
      dark: colors.light.primaryDark,
      light: colors.light.primaryLight
    },
    background: {
      default: colors.light.background,
      paper: colors.light.paper
    },
    text: {
      primary: colors.light.text,
      secondary: colors.light.textSecondary
    }
  },
  components: {
    ...baseTheme.components,
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundColor: colors.light.drawer,
          backdropFilter: 'blur(12px)',
          backgroundImage: 'linear-gradient(to bottom, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.95))'
        }
      }
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '.modal': {
            background: colors.light.paper
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: colors.light.input,
          borderRadius: '10px',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: colors.light.hover
          },
          '&.Mui-focused': {
            background: colors.light.background,
            boxShadow: `0 0 0 2px ${colors.light.primary}30`
          }
        },
        notchedOutline: {
          border: 'none'
        }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            background: colors.light.focus,
            outline: 'none'
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: colors.light.textSecondary,
          '&.Mui-selected': {
            color: colors.light.primary
          },
          '&.Mui-focusVisible': {
            backgroundColor: colors.light.focus
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.light.primary,
          '&.Mui-checked': {
            color: colors.light.primary
          },
          '&.Mui-focusVisible svg': {
            color: colors.light.textSecondary
          },
          '&.Mui-checked.Mui-focusVisible svg': {
            color: colors.light.textSecondary
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.light.paper,
          border: `1px solid ${colors.light.border}`
        }
      }
    }
  }
})

export { dark, light }
