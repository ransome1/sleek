const { store } = window.api;

export type ColorTheme = "light" | "dark";

export interface PriorityColor {
  background: string;
  selected: {
    background: string;
  };
}

export interface AttributeColor {
  background: string;
  text: string;
  chip?: {
    background: string;
    text: string;
  };
  selected?: {
    text: string;
    background: string;
  };
}

export interface ChipColor {
  background: string;
  text: string;
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
  opacity: Opacity;
}



export interface Opacity {
  disabled: number;
  hover: number;
  focus: number;
}

export interface PomodoroThemeColors {
  text: string;
  background: string;
  selected: {
    text: string;
    background: string;
  };
}

export interface NavigationThemeColors {
  iconColor: string;
  hoverBackground: string;
}

export interface ColorPalette {

  semantic: SemanticColors;
  attributes: {
    priority: {
      A: PriorityColor;
      B: PriorityColor;
      C: PriorityColor;
    };
    pomodoro: {
      light: PomodoroThemeColors;
      dark: PomodoroThemeColors;
    };
    projects: { light: AttributeColor; dark: AttributeColor };
    contexts: { light: AttributeColor; dark: AttributeColor };
    due: { light: AttributeColor; dark: AttributeColor };
    t: { light: AttributeColor; dark: AttributeColor };
    generic: { light: AttributeColor; dark: AttributeColor };
  };
  navigation: {
    logo: {
      start: string;
      end: string;
    };
    light: NavigationThemeColors;
    dark: NavigationThemeColors;
  };
  theme: {
    light: ThemeColors & { opacity: Opacity };
    dark: ThemeColors & { opacity: Opacity };
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
  return colors.attributes.priority[priority as keyof typeof colors.attributes.priority];
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
  const pomodoroColors = colors.attributes.pomodoro[theme];
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
  Object.entries(colors.attributes.priority).forEach(([key, priorityColor]) => {
    vars[`--priority-${key}`] = priorityColor.background;
    vars[`--priority-${key}-selected`] = priorityColor.selected.background;

    // Add pomodoro colors for current theme
vars["--pomodoro-text"] = pomodoroColors.text;
      vars["--pomodoro-bg"] = pomodoroColors.background;
      vars["--pomodoro-selected-text"] = pomodoroColors.selected.text;
      vars["--pomodoro-selected-bg"] = pomodoroColors.selected.background;
  });

  // Add pomodoro colors for current theme


  // Add navigation colors for current theme
  vars["--navigation-icon-color"] = navigationColors.iconColor;
  vars["--navigation-hover-bg"] = navigationColors.hoverBackground;

  // Add attribute colors and their selected states
  Object.entries(colors.attributes).forEach(([attrName, attrThemes]) => {
    const prefix = `--attribute-${attrName}`;
    const themeAttr = attrThemes[theme];
    if (themeAttr && typeof themeAttr === 'object' && 'text' in themeAttr && 'background' in themeAttr) {
      vars[`${prefix}-text`] = themeAttr.text;
      vars[`${prefix}-bg`] = themeAttr.background;
      if (themeAttr.selected) {
        vars[`${prefix}-selected-text`] = themeAttr.selected.text;
        vars[`${prefix}-selected-bg`] = themeAttr.selected.background;
      }
    }
  });

  // Add chip colors
// Add chip colors from generic attribute
const genericThemeColors = colors.attributes.generic[theme];
if (themeColors?.opacity) {
  vars["--opacity-disabled"] = String(themeColors.opacity.disabled);
  vars["--opacity-hover"] = String(themeColors.opacity.hover);
  vars["--opacity-focus"] = String(themeColors.opacity.focus);
}
if (genericThemeColors && genericThemeColors.chip) {
  vars["--chip-bg"] = genericThemeColors.chip.background;
  vars["--chip-text"] = genericThemeColors.chip.text;
}

  // Add gradients
vars["--gradient-logo-start"] = colors.navigation.logo.start;
vars["--gradient-logo-end"] = colors.navigation.logo.end;

  return vars;
}

export default colors;
