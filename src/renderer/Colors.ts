const { store } = window.api;

export type ColorTheme = "light" | "dark";

export interface PriorityColor {
  base: string;
  selected: string;
}

export interface AttributeColor {
  background: string;
  text: string;
  selected?: {
    text: string;
    background: string;
  };
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
  theme: {
    light: ThemeColors;
    dark: ThemeColors;
  };

  attributes: {
    projects: { light: AttributeColor; dark: AttributeColor };
    contexts: { light: AttributeColor; dark: AttributeColor };
    pomodoro: { light: AttributeColor; dark: AttributeColor };
    generic: { light: AttributeColor; dark: AttributeColor };
  };
  gradients: Gradients;
  opacity: Opacity;
  chip: {
    light: {
      background: string;
      text: string;
    };
    dark: {
      background: string;
      text: string;
    };
  };
}

const storeColors = store.getColors("colors");
if (!storeColors) {
  console.log("Colors from store are undefined");
}
const colors: ColorPalette = store.getColors("colors") as ColorPalette;

/**
 * Get all colors for a specific theme (light or dark)
 */
export function getThemeColors(theme: ColorTheme): ThemeColors {
  return colors.theme[theme];
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

  const themeAttr = attr[theme];
  if (!themeAttr) return null;

  return {
    text: themeAttr.text,
    background: themeAttr.background,
    selectedText: themeAttr.selected?.text,
    selectedBackground: themeAttr.selected?.background,
  };
}

/**
 * Generate CSS custom properties (variables) for a theme
 * Returns a Record that can be applied to document.documentElement.style
 */
export function getCssVariables(theme: ColorTheme): Record<string, string> {
  const themeColors = colors.theme[theme];
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
  Object.entries(colors.attributes).forEach(([attrName, attrThemes]) => {
    const prefix = `--attribute-${attrName}`;
    const themeAttr = attrThemes[theme];

    vars[`${prefix}-text`] = themeAttr.text;
    vars[`${prefix}-bg`] = themeAttr.background;
    if (themeAttr.selected) {
      vars[`${prefix}-selected-text`] = themeAttr.selected.text;
      vars[`${prefix}-selected-bg`] = themeAttr.selected.background;
    }
  });

  // Add chip colors
  vars["--chip-bg"] = colors.chip[theme].background;
  vars["--chip-text"] = colors.chip[theme].text;

  // Add gradients
  Object.entries(colors.gradients).forEach(([name, gradient]) => {
    vars[`--gradient-${name}-start`] = gradient.start;
    vars[`--gradient-${name}-end`] = gradient.end;
  });

  return vars;
}

export default colors;
