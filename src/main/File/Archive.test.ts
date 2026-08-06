import { expect, describe, it, vi, beforeEach } from "vitest";
import { archiveSingleTodo } from "./Archive";
import { File } from "@sleek-types";
import * as ActiveModule from "./Active";

const mockActiveFile: File = {
  active: true,
  todoFileName: "todo.txt",
  todoFilePath: "/test/todo.txt",
  todoFileBookmark: null,
  doneFilePath: "/test/done.txt",
  doneFileBookmark: null,
};

vi.mock("electron", () => ({
  app: {
    startAccessingSecurityScopedResource: vi.fn(),
    getPath: vi.fn(() => "/test"),
  },
}));

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn((path: string) => {
      if (path === "/test/todo.txt") return "todo1\ntodo2\ntodo3";
      if (path === "/test/done.txt") return "done1";
      return "";
    }),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => false),
    copyFileSync: vi.fn(),
    renameSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
}));

vi.mock("./Active", () => ({
  getActiveFile: vi.fn(() => mockActiveFile),
}));

vi.mock("../Stores", () => ({
  SettingsStore: {
    get: vi.fn((key: string) => {
      if (key === "enableAtomicWrite") return false;
      return undefined;
    }),
  },
}));

vi.mock("../index", () => ({
  mainWindow: {
    webContents: {
      send: vi.fn(),
    },
  },
}));

vi.mock("../i18n", () => ({
  default: {
    t: vi.fn((key: string) => key),
  },
}));

vi.mock("./File", () => ({
  readFileContent: vi.fn((path: string) => {
    if (path === "/test/todo.txt") return "todo1\ntodo2\ntodo3";
    if (path === "/test/done.txt") return "done1";
    return "";
  }),
}));

import * as WriteModule from "./Write";

vi.mock("./Write", () => ({
  writeToFile: vi.fn(),
}));

describe("archiveSingleTodo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when no active file", () => {
    vi.mocked(ActiveModule.getActiveFile).mockReturnValueOnce(null);
    expect(() => archiveSingleTodo(0)).toThrow(
      "archive.error.todoFileNotDefined",
    );
  });

  it("throws when doneFilePath is missing", () => {
    vi.mocked(ActiveModule.getActiveFile).mockReturnValueOnce({
      ...mockActiveFile,
      doneFilePath: null,
    });
    expect(() => archiveSingleTodo(0)).toThrow(
      "archive.error.archivingFileNotDefined",
    );
  });

  it("moves the correct todo line to done file", () => {
    const result = archiveSingleTodo(1);
    expect(result).toBe("archive.success");

    expect(WriteModule.writeToFile).toHaveBeenCalledTimes(2);

    const [doneContent, donePath] = vi.mocked(WriteModule.writeToFile).mock
      .calls[0];
    expect(donePath).toBe("/test/done.txt");
    expect(doneContent).toBe("done1\ntodo2");

    const [todoContent, todoPath] = vi.mocked(WriteModule.writeToFile).mock
      .calls[1];
    expect(todoPath).toBe("/test/todo.txt");
    expect(todoContent).toBe("todo1\ntodo3");
  });
});
