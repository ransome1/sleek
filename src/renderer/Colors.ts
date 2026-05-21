import colorsJson from "./colors.json";

export type ColorTheme = "light" | "dark";

export interface PriorityColor {
  base: string;
  selected: string;
}

export interface AttributeColor {
  // Old structure (for projects, contexts, generic)
  text?: string;
  background?: string;
  darkText?: string;
  darkBackground?: string;
  selectedLight?: string;
  selectedDark?: string;
  // New structure (for pomodoro)
  selectedText?: string;
  selectedBackground?: string;
}

export interface SemanticColors {
  primary: string;
  error: string;
  warning: string;
  success: string;
  notification: string;
  focus: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  outline: string;
  outlineVariant: string;
  onSurface: string;
  onBackground: string;
}

export interface Gradients {
  logo: {
    start: string;
    end: string;
  };
}

export interface Opacity {
  disabled: number;
  hover: number;
  focus: number;
}

export interface ChipDarkColors {
  background: string;
  backgroundFocus: string;
}

export interface PomodoroThemeColors {
  base: {
    text: string;
    background: string;
  };
  selected: {
    text: string;
    background: string;
  };
  badgeText: string;
  badgeBackground: string;
}

export interface NavigationThemeColors {
  iconColor: string;
  hoverBackground: string;
}

export interface ColorPalette {
  metadata: {
    version: string;
    description: string;
  };
  semantic: SemanticColors;
  priority: {
    A: PriorityColor;
    B: PriorityColor;
    C: PriorityColor;
  };
  pomodoro: {
    light: PomodoroThemeColors;
    dark: PomodoroThemeColors;
  };
  navigation: {
    light: NavigationThemeColors;
    dark: NavigationThemeColors;
  };
  attributes: {
    projects: AttributeColor;
    contexts: AttributeColor;
    pomodoro: AttributeColor;
    generic: AttributeColor;
  };
  light: ThemeColors;
  dark: ThemeColors;
  chipDark: ChipDarkColors;
  gradients: Gradients;
  opacity: Opacity;
}

const colors: ColorPalette = colorsJson as ColorPalette;

/**
 * Get all colors for a specific theme (light or dark)
 */
export function getThemeColors(theme: ColorTheme): ThemeColors {
  return colors[theme];
}

/**
 * Get priority color by priority letter (A, B, C)
 */
export function getPriorityColor(priority: string): PriorityColor | undefined {
  return colors.priority[priority as keyof typeof colors.priority];
}

/**
 * Get text and background colors for an attribute in a specific theme
 */
export function getAttributeColors(
  attribute: string,
  theme: ColorTheme,
): {
  text: string;
  background: string;
  selectedText?: string;
  selectedBackground?: string;
} | null {
  const attr = colors.attributes[attribute as keyof typeof colors.attributes];
  if (!attr) return null;

  // Handle old structure (projects, contexts, generic)
  if (attr.text && attr.background) {
    return {
      text: theme === "light" ? attr.text : attr.darkText || attr.text,
      background:
        theme === "light"
          ? attr.background
          : attr.darkBackground || attr.background,
      selectedText: theme === "light" ? attr.selectedLight : attr.selectedDark,
      selectedBackground:
        theme === "light" ? attr.selectedLight : attr.selectedDark,
    };
  }

  // Handle new structure (pomodoro)
  if (attr.selectedText && attr.selectedBackground) {
    return {
      text: attr.text || "",
      background: attr.background || "",
      selectedText: attr.selectedText,
      selectedBackground: attr.selectedBackground,
    };
  }

  return null;
}

/**
 * Generate CSS custom properties (variables) for a theme
 * Returns a Record that can be applied to document.documentElement.style
 */
export function getCssVariables(theme: ColorTheme): Record<string, string> {
  const themeColors = colors[theme];
  const pomodoroColors = colors.pomodoro[theme];
  const navigationColors = colors.navigation[theme];
  const vars: Record<string, string> = {};

  // Add theme colors
  Object.entries(themeColors).forEach(([key, value]) => {
    if (typeof value === "string") {
      vars[`--color-${key}`] = value;
    }
  });

  // Add semantic colors
  Object.entries(colors.semantic).forEach(([key, value]) => {
    vars[`--semantic-${key}`] = value;
  });

  // Add priority colors and their selected states
  Object.entries(colors.priority).forEach(([key, priorityColor]) => {
    vars[`--priority-${key}`] = priorityColor.base;
    vars[`--priority-${key}-selected`] = priorityColor.selected;
  });

  // Add pomodoro colors for current theme
  vars["--pomodoro-text"] = pomodoroColors.base.text;
  vars["--pomodoro-bg"] = pomodoroColors.base.background;
  vars["--pomodoro-selected-text"] = pomodoroColors.selected.text;
  vars["--pomodoro-selected-bg"] = pomodoroColors.selected.background;
  vars["--pomodoro-badge-text"] = pomodoroColors.badgeText;
  vars["--pomodoro-badge-bg"] = pomodoroColors.badgeBackground;

  // Add navigation colors for current theme
  vars["--navigation-icon-color"] = navigationColors.iconColor;
  vars["--navigation-hover-bg"] = navigationColors.hoverBackground;

  // Add attribute colors and their selected states
  Object.entries(colors.attributes).forEach(([attrName, attrColors]) => {
    const prefix = `--attribute-${attrName}`;

    // Handle old structure (projects, contexts, generic)
    if (attrColors.text && attrColors.background) {
      vars[`${prefix}-text`] =
        theme === "light"
          ? attrColors.text
          : attrColors.darkText || attrColors.text;
      vars[`${prefix}-bg`] =
        theme === "light"
          ? attrColors.background
          : attrColors.darkBackground || attrColors.background;
      if (theme === "light" && attrColors.selectedLight) {
        vars[`${prefix}-selected`] = attrColors.selectedLight;
      } else if (theme === "dark" && attrColors.selectedDark) {
        vars[`${prefix}-selected`] = attrColors.selectedDark;
      }
    }
    // Handle new structure (pomodoro)
    else if (attrColors.selectedText && attrColors.selectedBackground) {
      vars[`${prefix}-text`] = attrColors.text || "";
      vars[`${prefix}-bg`] = attrColors.background || "";
      vars[`${prefix}-selected-text`] = attrColors.selectedText;
      vars[`${prefix}-selected-bg`] = attrColors.selectedBackground;
    }
  });

  // Add chip dark colors
  Object.entries(colors.chipDark).forEach(([key, value]) => {
    vars[`--chipDark-${key}`] = value;
  });

  // Add gradients
  Object.entries(colors.gradients).forEach(([name, gradient]) => {
    vars[`--gradient-${name}-start`] = gradient.start;
    vars[`--gradient-${name}-end`] = gradient.end;
  });

  return vars;
}

export default colors;
