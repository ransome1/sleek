export interface TodoObject {
  // todo.txt body section
  body: string;
  lineNumber: number;
  complete: boolean;

  // Date of creation as YYYY-MM-DD
  created: string | null;
  // Date of completion as YYYY-MM-DD
  completed: string | null;

  contexts: string[] | null;
  projects: string[] | null;

  priority: string | null;
  hidden: boolean;
  due: string | null;
  dueString: string | null;
  t: string | null;
  tString: string | null;
  rec: string | null;

  pm: number | null;

  string: string;
  notify: boolean;
}

export interface TodoGroup {
  title: string | null;
  visible: boolean;
  todoObjects: TodoObject[];
}

export type TodoGroups = Record<string, TodoGroup>;

export type TodoData = TodoGroup[];

export type Attributes = {
  [key in AttributeKey]: AttributeGroup;
};

export type AttributeKey =
  | "priority"
  | "due"
  | "t"
  | "contexts"
  | "projects"
  | "rec"
  | "pm"
  | "hidden"
  | "created"
  | "completed";

export interface AttributeGroup {
  [key: string]: AttributeEntry;
}

export interface AttributeEntry {
  count: number;
  notify: boolean;
  hide: boolean;
  value: string[];
}

export interface File {
  active: boolean;
  todoFileName: string;
  todoFilePath: string;
  todoFileBookmark: string | null;
  doneFilePath: string | null;
  doneFileBookmark: string | null;
}
