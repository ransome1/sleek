import { nativeTheme } from "electron";
import { SettingsStore } from "./Stores";
import { HandleTheme } from "./Theme";
import "./Theme";

vi.mock("electron", () => ({
  app: {
    getPath: vi.fn().mockReturnValue(""),
  },
  nativeTheme: {
    on: vi.fn(),
    themeSource: vi.fn(),
  },
}));

vi.mock("./Stores", () => {
  return {
    SettingsStore: {
      set: vi.fn(),
      get: vi.fn(),
    },
  };
});

vi.mock("./index.js", () => {
  return {
    mainWindow: vi.fn(),
  };
});

const nativeThemeListener = nativeTheme.on.mock.calls.find(
  (call) => call[0] === "updated",
)?.[1];

describe("nativeTheme.on", () => {
  it("Sets dark setting when themeSource is dark", () => {
    vi.mocked(nativeTheme).themeSource = "dark";
    nativeThemeListener();
    expect(SettingsStore.set).toHaveBeenCalledWith("shouldUseDarkColors", true);
  });
  it("Sets light setting when themeSource is light", () => {
    vi.mocked(nativeTheme).themeSource = "light";
    nativeThemeListener();
    expect(SettingsStore.set).toHaveBeenCalledWith(
      "shouldUseDarkColors",
      false,
    );
  });
  it("Sets dark setting when themeSource is system and OS is set to dark", () => {
    vi.mocked(nativeTheme).themeSource = "system";
    vi.mocked(nativeTheme).shouldUseDarkColors = true;
    nativeThemeListener();
    expect(SettingsStore.set).toHaveBeenCalledWith("shouldUseDarkColors", true);
  });
  it("Sets dark setting when themeSource is system and OS is set to dark", () => {
    vi.mocked(nativeTheme).themeSource = "system";
    vi.mocked(nativeTheme).shouldUseDarkColors = false;
    nativeThemeListener();
    expect(SettingsStore.set).toHaveBeenCalledWith(
      "shouldUseDarkColors",
      false,
    );
  });
});

describe("HandleTheme", () => {
  it("If passed color theme is dark, the actual themeSource will be dark", () => {
    HandleTheme("dark");
    expect(nativeTheme.themeSource).toBe("dark");
  });
  it("If an unkown color theme is passed, it will fallback to system", () => {
    HandleTheme("unknown_theme");
    expect(nativeTheme.themeSource).toBe("system");
  });
  it("If passed color theme is undefined, it will fallback to system", () => {
    HandleTheme(undefined);
    expect(nativeTheme.themeSource).toBe("system");
  });
});
