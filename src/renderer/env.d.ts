/// <reference types="vite/client" />

// Global type definitions for Sleek

interface Window {
  api: {
    store: {
      getConfig: (key?: string) => any
      setConfig: (property: string, value: any, rerender?: boolean) => any
      setFilters: (property: string, value: any) => any
      getFilters: (key?: string) => any
      notifiedTodoObjects: (value: any) => any
    }
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void
      on: (channel: string, func: (...args: any[]) => void) => () => void
      off: (channel: string, func: (...args: any[]) => void) => void
    }
  }
}

interface TodoObject {
  lineNumber: number
  body: string | null
  string: string
  complete: boolean
  created: string | null
  completed: string | null
  priority: string | null
  contexts: string[] | null
  projects: string[] | null
  due: string | null
  dueString: string | null
  notify: boolean
  t: string | null
  tString: string | null
  rec: string | null
  hidden: boolean
  pm: string | number | null
}

interface TodoGroup {
  title: string | null
  todoObjects: TodoObject[]
  visible: boolean
}

type TodoData = TodoGroup[]

interface Filters {
  [key: string]: string[]
}

interface Settings {
  shouldUseDarkColors: boolean
  isNavigationOpen: boolean
  zoom: number
  matomo: boolean
  files: File[]
  sorting: Sorting[]
  sortCompletedLast: boolean
  showHidden: boolean
  fileSorting: boolean
  notificationsAllowed: boolean
  excludeLinesWithPrefix: string[]
}

interface File {
  active: boolean
  todoFileName: string
  todoFilePath: string
  todoFileBookmark: string | null
  doneFilePath: string | null
  doneFileBookmark: string | null
}

interface FileObject extends File {}

interface Sorting {
  value: string
  invert: boolean
}

interface HeadersObject {
  availableObjects: number | null
  completedObjects: number | null
  visibleObjects: number | null
}

type Headers = HeadersObject

interface Attributes {
  priority: { [key: string]: number }
  projects: { [key: string]: number }
  contexts: { [key: string]: number }
  due: { [key: string]: number }
  t: { [key: string]: number }
  rec: { [key: string]: number }
  pm: { [key: string]: number }
  created: { [key: string]: number }
  completed: { [key: string]: number }
}

interface RequestedData {
  todoData: TodoData
  attributes: Attributes
  headers: HeadersObject
  filters: Filters
}

interface ContextMenu {
  event: React.MouseEvent
  items: ContextMenuItem[]
}

interface ContextMenuItem {
  id: string
  label: string
  function?: () => void
  promptItem?: PromptItem
}

interface PromptItem {
  id?: string
  headline: string
  text?: string
  body?: string
  button1?: string
  button2?: string
  onButton1?: () => void
  onButton2?: () => void
  acceptFunction?: () => void
  declineFunction?: () => void
}

interface Badge {
  count: number
}

interface SearchFilter {
  label: string
  suppress: boolean
}

interface DateAttributes {
  [key: string]: {
    date: string | null
    string: string | null
    notify: boolean
  }
}

interface RecurrenceInterval {
  Daily: string
  BusinessDays: string
  Weekly: string
  Monthly: string
  Annually: string
}
