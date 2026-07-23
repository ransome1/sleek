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
  };
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