import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Row from "./Row";
import {
  TodoObject,
  Filters,
  SettingStore,
  ContextMenuItem,
} from "@sleek-types";

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
  inprogress: null,
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

const renderRow = (
  todo: Partial<TodoObject> = {},
  setContextMenu: () => void = () => {},
) => {
  const todoObject = { ...baseTodo, ...todo };
  return render(
    <Row
      todoObject={todoObject}
      filters={baseFilters}
      setDialogOpen={() => {}}
      setTodoObject={() => {}}
      setContextMenu={setContextMenu}
      setPromptItem={() => {}}
      settings={baseSettings}
      onNotification={vi.fn()}
    />,
  );
};

const openRowContextMenu = (todo: Partial<TodoObject>): ContextMenuItem[] => {
  const setContextMenu = vi.fn();
  renderRow(todo, setContextMenu);
  fireEvent.contextMenu(screen.getByTestId("datagrid-row"));
  return setContextMenu.mock.calls[0][0].items;
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

  it("should send inprogress toggle on middle-click", () => {
    renderRow();
    fireEvent.mouseDown(screen.getByRole("checkbox"), { button: 1 });

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

  it("should toggle off inprogress on middle-click when todo is already inprogress", () => {
    renderRow({ inprogress: "1" });
    fireEvent.mouseDown(screen.getByRole("checkbox"), { button: 1 });

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

  it("should not toggle inprogress on middle-click when todo is already complete", () => {
    renderRow({ complete: true });
    fireEvent.mouseDown(screen.getByRole("checkbox"), { button: 1 });

    expect(mockIpcRendererSend).not.toHaveBeenCalled();
  });

  it("should label the checkbox as in progress when todo is inprogress", () => {
    renderRow({ inprogress: "1" });

    expect(screen.getByRole("checkbox")).toHaveAccessibleName(
      "shared.attributeMapping.inprogress",
    );
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("should offer mark in progress with a middle-click hint in the context menu", () => {
    const item = openRowContextMenu({}).find((i) => i.id === "inprogress");

    expect(item?.label).toBe("markInProgress");
    expect(item?.hint).toBe("middleClick");

    item?.function?.();
    expect(mockIpcRendererSend).toHaveBeenCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "1",
      true,
    );
  });

  it("should offer remove in progress in the context menu when todo is inprogress", () => {
    const item = openRowContextMenu({ inprogress: "1" }).find(
      (i) => i.id === "inprogress",
    );

    expect(item?.label).toBe("removeInProgress");

    item?.function?.();
    expect(mockIpcRendererSend).toHaveBeenCalledWith(
      "updateTodoObject",
      1,
      "Test todo",
      "inprogress",
      "",
      true,
    );
  });

  it("should not offer in progress in the context menu when todo is complete", () => {
    const items = openRowContextMenu({ complete: true });

    expect(items.some((i) => i.id === "inprogress")).toBe(false);
  });
});
