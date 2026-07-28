import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IpcMainEvent } from "electron";
import { ipcHandlers } from "./IpcHandlers";

const mocks = vi.hoisted(() => ({
  archiveTodos: vi.fn(),
  changeCompleteState: vi.fn(),
  createTodoObject: vi.fn(),
  dataRequest: vi.fn(),
  handleError: vi.fn(),
  removeLineFromFile: vi.fn(),
  writeSingleTodoToFile: vi.fn(),
}));

vi.mock("electron", () => ({
  clipboard: {
    writeText: vi.fn(),
  },
  ipcMain: {
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  shell: {
    openExternal: vi.fn(),
    showItemInFolder: vi.fn(),
  },
}));

vi.mock("./DataRequest/ChangeCompleteState", () => ({
  changeCompleteState: mocks.changeCompleteState,
}));

vi.mock("./Stores", () => ({
  ColorsStore: {},
  FiltersStore: {},
  NotificationsStore: {},
  SettingsStore: {},
}));

vi.mock("./DataRequest/DataRequest", () => ({
  dataRequest: mocks.dataRequest,
  searchString: "active search",
}));

vi.mock("./DataRequest/CreateTodoObjects", () => ({
  createTodoObject: mocks.createTodoObject,
}));

vi.mock("./File/Write", () => ({
  removeLineFromFile: mocks.removeLineFromFile,
  writeSingleTodoToFile: mocks.writeSingleTodoToFile,
}));

vi.mock("./File/Archive", () => ({
  archiveTodos: mocks.archiveTodos,
  checkArchiveReadiness: vi.fn(),
}));

vi.mock("./File/File", () => ({
  activateFile: vi.fn(),
  registerTodoFile: vi.fn(),
  removeFile: vi.fn(),
}));

vi.mock("./File/Dialog", () => ({
  createFile: vi.fn(),
  openFile: vi.fn(),
}));

vi.mock("./Shared", () => ({
  HandleError: mocks.handleError,
}));

vi.mock("./IpcMain", () => ({
  handleDeleteFilterValue: vi.fn(),
  handleRenameFilterValue: vi.fn(),
}));

const handlers = Object.fromEntries(
  ipcHandlers.map(({ channel, handler }) => [channel, handler]),
);

function createEvent(): IpcMainEvent {
  return {
    reply: vi.fn(),
  } as unknown as IpcMainEvent;
}

describe("mutation IPC handlers", () => {
  const requestedData = { todoData: [] };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.archiveTodos.mockReturnValue("Archived");
    mocks.changeCompleteState.mockReturnValue("x Todo");
    mocks.createTodoObject.mockReturnValue({
      lineNumber: 2,
      string: "Todo due:2026-08-01",
    });
    mocks.dataRequest.mockReturnValue(requestedData);
  });

  it.each([
    {
      name: "adding a todo",
      channel: "writeSingleTodoToFile",
      args: [-1, "New todo", false],
      mutation: mocks.writeSingleTodoToFile,
    },
    {
      name: "editing a todo",
      channel: "writeSingleTodoToFile",
      args: [2, "Edited todo", true],
      mutation: mocks.writeSingleTodoToFile,
    },
    {
      name: "deleting a todo",
      channel: "removeLineFromFile",
      args: [2],
      mutation: mocks.removeLineFromFile,
    },
    {
      name: "archiving todos",
      channel: "archiveTodos",
      args: [],
      mutation: mocks.archiveTodos,
    },
  ])("refreshes requested data after $name", ({ channel, args, mutation }) => {
    const event = createEvent();

    handlers[channel](event, ...args);

    expect(mutation).toHaveBeenCalled();
    expect(mocks.dataRequest).toHaveBeenCalledWith("active search");
    expect(event.reply).toHaveBeenCalledWith("requestData", requestedData);
    expect(mutation.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.dataRequest.mock.invocationCallOrder[0],
    );
  });

  it("refreshes after persisting a todo object update", () => {
    const event = createEvent();

    handlers.updateTodoObject(event, 2, "Todo", "due", "2026-08-01");

    expect(mocks.writeSingleTodoToFile).toHaveBeenCalledWith(
      2,
      "Todo due:2026-08-01",
      true,
    );
    expect(mocks.dataRequest).toHaveBeenCalledWith("active search");
    expect(event.reply).toHaveBeenCalledWith("requestData", requestedData);
    expect(event.reply).toHaveBeenCalledWith("updateTodoObject", {
      lineNumber: 2,
      string: "Todo due:2026-08-01",
    });
  });

  it("refreshes after persisting the final completion state", () => {
    const event = createEvent();

    handlers.toggleTodoComplete(event, 2, "Todo rec:1w", true);

    expect(mocks.changeCompleteState).toHaveBeenCalledWith("Todo rec:1w", true);
    expect(mocks.writeSingleTodoToFile).toHaveBeenCalledWith(
      2,
      "x Todo",
      false,
    );
    expect(mocks.dataRequest).toHaveBeenCalledWith("active search");
    expect(event.reply).toHaveBeenCalledWith("requestData", requestedData);
    expect(
      mocks.writeSingleTodoToFile.mock.invocationCallOrder[0],
    ).toBeLessThan(mocks.dataRequest.mock.invocationCallOrder[0]);
  });

  it("reports mutation errors without refreshing requested data", () => {
    const event = createEvent();
    const error = new Error("write failed");
    mocks.removeLineFromFile.mockImplementationOnce(() => {
      throw error;
    });

    handlers.removeLineFromFile(event, 2);

    expect(mocks.handleError).toHaveBeenCalledWith(error);
    expect(event.reply).toHaveBeenCalledWith("responseFromMainProcess", error);
    expect(mocks.dataRequest).not.toHaveBeenCalled();
    expect(event.reply).not.toHaveBeenCalledWith(
      "requestData",
      expect.anything(),
    );
  });

  it("reports refresh errors without emitting stale requested data", () => {
    const event = createEvent();
    const error = new Error("read failed");
    mocks.dataRequest.mockImplementationOnce(() => {
      throw error;
    });

    handlers.writeSingleTodoToFile(event, 2, "Edited todo", true);

    expect(mocks.writeSingleTodoToFile).toHaveBeenCalled();
    expect(mocks.handleError).toHaveBeenCalledWith(error);
    expect(event.reply).toHaveBeenCalledWith("responseFromMainProcess", error);
    expect(event.reply).not.toHaveBeenCalledWith(
      "requestData",
      expect.anything(),
    );
  });
});
