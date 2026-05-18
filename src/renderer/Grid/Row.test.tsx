import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Row from "./Row";
import { TodoObject, Filters, SettingStore } from "@sleek-types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

const mockIpcRendererSend = vi.spyOn(window.api.ipcRenderer, "send");

const baseTodo: TodoObject = {
  body: "Test todo",
  lineNumber: 1,
  complete: false,
  created: null,
  completed: null,
  contexts: null,
  projects: null,
  priority: null,
  hidden: false,
  inprogress: false,
  due: null,
  dueString: null,
  t: null,
  tString: null,
  rec: null,
  pm: null,
  string: "Test todo",
  notify: false,
};

const baseSettings: SettingStore = {
  appendCreationDate: false,
  convertRelativeToAbsoluteDates: false,
  useHumanFriendlyDates: false,
  bulkTodoCreation: false,
  weekStart: 1,
  language: "en",
  tray: false,
  invertTrayColor: false,
  startMinimized: false,
  notificationsAllowed: false,
  notificationThreshold: 0,
  colorTheme: "system",
  menuBarVisibility: false,
  disableAnimations: false,
  compact: false,
  zoom: 1,
  matomo: false,
  showCompleted: false,
  showHidden: false,
  showAttributesFromHiddenTodosInDrawer: true,
  fileSorting: false,
  sortCompletedLast: false,
  dueDateInTheFuture: false,
  files: [],
  sorting: [{ invert: false, value: "priority" }],
  windowDimensions: null,
  windowMaximized: false,
  windowPosition: null,
  isDrawerOpen: false,
  isNavigationOpen: false,
  isSearchOpen: false,
  accordionOpenState: [],
  showFileTabs: false,
  shouldUseDarkColors: false,
  customStylesPath: "",
  excludeLinesWithPrefix: [],
  chokidarOptions: {},
  __internal__: {
    migrations: {
      version: "",
    },
  },
  channel: "",
  anonymousUserId: "",
};

const baseFilters: Filters = {
  priority: [],
  due: [],
  t: [],
  contexts: [],
  projects: [],
  rec: [],
  inprogress: [],
  pm: [],
  hidden: [],
  created: [],
  completed: [],
};

const renderRow = (todo: Partial<TodoObject> = {}) => {
  const todoObject = { ...baseTodo, ...todo };
  return render(
    <Row
      todoObject={todoObject}
      filters={baseFilters}
      setDialogOpen={() => {}}
      setTodoObject={() => {}}
      setContextMenu={() => {}}
      setPromptItem={() => {}}
      settings={baseSettings}
      onNotification={vi.fn()}
    />,
  );
};

describe("Row", () => {
  beforeEach(() => {
    mockIpcRendererSend.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send complete toggle on regular checkbox click", () => {
    renderRow();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockIpcRendererSend).toHaveBeenCalledWith(
      "toggleTodoComplete",
      1,
      "Test todo",
      true,
    );
  });

  it("should send inprogress toggle and NOT complete toggle on ctrl+click", () => {
    renderRow();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.mouseDown(checkbox, { ctrlKey: true, button: 0 });
    fireEvent.click(checkbox, { ctrlKey: true, button: 0 });

    expect(mockIpcRendererSend).toHaveBeenCalledTimes(1);
    expect(mockIpcRendererSend).toHaveBeenCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "1",
      true,
    );
  });

  it("should send inprogress toggle and NOT complete toggle on middle-click", () => {
    renderRow();
    const checkbox = screen.getByRole("checkbox");
    fireEvent.mouseDown(checkbox, { button: 1 });
    fireEvent.click(checkbox, { button: 1 });

    expect(mockIpcRendererSend).toHaveBeenCalledTimes(1);
    expect(mockIpcRendererSend).toHaveBeenCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "1",
      true,
    );
  });

  it("should toggle off inprogress when todo is already inprogress", () => {
    renderRow({ inprogress: true });
    const checkbox = screen.getByRole("checkbox");
    fireEvent.mouseDown(checkbox, { ctrlKey: true, button: 0 });
    fireEvent.click(checkbox, { ctrlKey: true, button: 0 });

    expect(mockIpcRendererSend).toHaveBeenCalledTimes(1);
    expect(mockIpcRendererSend).toHaveBeenCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "",
      true,
    );
  });

  it("should not toggle inprogress when todo is already complete", () => {
    renderRow({ complete: true });
    const checkbox = screen.getByRole("checkbox");
    fireEvent.mouseDown(checkbox, { ctrlKey: true, button: 0 });
    fireEvent.click(checkbox, { ctrlKey: true, button: 0 });

    expect(mockIpcRendererSend).not.toHaveBeenCalled();
  });

  it("should never mark as done on repeated ctrl+clicks", () => {
    const { rerender } = renderRow();
    const checkbox = screen.getByRole("checkbox");

    fireEvent.mouseDown(checkbox, { ctrlKey: true, button: 0 });
    fireEvent.click(checkbox, { ctrlKey: true, button: 0 });
    expect(mockIpcRendererSend).toHaveBeenCalledTimes(1);
    expect(mockIpcRendererSend).toHaveBeenLastCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "1",
      true,
    );

    mockIpcRendererSend.mockClear();

    rerender(
      <Row
        todoObject={{ ...baseTodo, inprogress: true }}
        filters={baseFilters}
        setDialogOpen={() => {}}
        setTodoObject={() => {}}
        setContextMenu={() => {}}
        setPromptItem={() => {}}
        settings={baseSettings}
        onNotification={vi.fn()}
      />,
    );

    fireEvent.mouseDown(checkbox, { ctrlKey: true, button: 0 });
    fireEvent.click(checkbox, { ctrlKey: true, button: 0 });
    expect(mockIpcRendererSend).toHaveBeenCalledTimes(1);
    expect(mockIpcRendererSend).toHaveBeenLastCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "",
      true,
    );

    mockIpcRendererSend.mockClear();

    rerender(
      <Row
        todoObject={{ ...baseTodo, inprogress: false }}
        filters={baseFilters}
        setDialogOpen={() => {}}
        setTodoObject={() => {}}
        setContextMenu={() => {}}
        setPromptItem={() => {}}
        settings={baseSettings}
        onNotification={vi.fn()}
      />,
    );

    fireEvent.mouseDown(checkbox, { ctrlKey: true, button: 0 });
    fireEvent.click(checkbox, { ctrlKey: true, button: 0 });
    expect(mockIpcRendererSend).toHaveBeenCalledTimes(1);
    expect(mockIpcRendererSend).toHaveBeenLastCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "1",
      true,
    );

    for (const call of mockIpcRendererSend.mock.calls) {
      expect(call[0]).not.toBe("toggleTodoComplete");
    }
  });
});
