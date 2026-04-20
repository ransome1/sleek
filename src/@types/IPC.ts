import { Attributes, Filters, HeadersObject, TodoData } from ".";

export interface RequestedData {
  attributes: Attributes;
  filters: Filters;
  headers: HeadersObject;
  todoData: TodoData;
}
