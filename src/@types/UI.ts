import React from "react";
import { AttributeKey } from ".";

export interface SearchFilter {
  label?: string;
  inputValue?: string;
  title?: string;
  suppress?: boolean;
}

export interface Badge {
  count: number;
}

export interface HeadersObject {
  availableObjects: number;
  completedObjects: number;
  visibleObjects: number;
}

export type Filters = {
  [key in AttributeKey]: Filter[];
};

export interface Filter {
  value: string[];
  exclude: boolean;
  groupedName: string | null;
}

export interface Sorting {
  invert: boolean;
  value: AttributeKey;
}

export interface ContextMenu {
  event: React.MouseEvent<Element, MouseEvent>;
  items: ContextMenuItem[];
}

export interface ContextMenuItem {
  id: string;
  label: string;
  promptItem?: PromptItem;
  function?: () => void;
}

export interface PromptItem {
  id?: string;
  headline?: string;
  text?: string;
  button1?: string;
  onButton1?: React.MouseEventHandler<HTMLButtonElement>;
  button2?: string;
  onButton2?: React.MouseEventHandler<HTMLButtonElement>;
}
