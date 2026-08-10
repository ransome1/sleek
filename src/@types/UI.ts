import type React from "react";

export interface PromptItem {
  id?: string;
  headline: string;
  text: string;
  button1: string;
  onButton1: (inputValue?: string) => void;
  button2?: string;
  onButton2?: (inputValue?: string) => void;
  input?: {
    label: string;
    defaultValue?: string;
    validate: (val: string) => string | true;
    onValidationError?: (errorMessage: string) => void;
  };
  enterKeyTriggersButton?: 1 | 2;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  promptItem?: PromptItem;
  function?: () => void;
}

export interface ContextMenu {
  event: React.MouseEvent;
  items: ContextMenuItem[];
}

export interface Badge {
  count: number;
}

// Snackbar (UI Toast) - for user feedback messages
export type AlertSeverity =
  "success" | "error" | "info" | "warning" | undefined;

export interface SnackbarState {
  open: boolean;
  content: string | null;
  severity: AlertSeverity;
}

export type SnackbarAction =
  | { type: "show"; severity: AlertSeverity; content: string }
  | { type: "close" };
