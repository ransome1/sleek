export interface File {
  active: boolean;
  todoFileName: string;
  todoFilePath: string;
  todoFileBookmark: string | null;
  doneFilePath: string | null;
  doneFileBookmark: string | null;
}

export interface SearchFilter {
  label: string;
  suppress: boolean;
}

export interface Badge {
  count: number;
}
