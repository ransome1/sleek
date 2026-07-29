import { Attributes, TodoData } from ".";

export interface Filter {
  value: string[];
  exclude: boolean;
  groupedName?: string | null;
}

export interface SearchFilter {
  label?: string;
  suppress?: boolean;
  inputValue?: string;
  title?: string;
}

export interface Filters {
  [key: string]: Filter[];
}

export interface HeadersObject {
  availableObjects: number;
  completedObjects: number;
  visibleObjects: number;
}

export interface RequestedData {
  attributes: Attributes;
  filters: Filters;
  headers: HeadersObject;
  todoData: TodoData;
}
