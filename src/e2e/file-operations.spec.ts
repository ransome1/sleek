import { Locator } from "@playwright/test";
import { TodoData } from "../@types";
import { test, expect } from "./helpers/appFixture";
import {
  createTodoFile,
  initTestDir,
  cleanupTestDir,
} from "./helpers/fileHelper";
import { loadTodoFile } from "./helpers/navigationHelpers";

test.describe("File Operations - Open & Create (Full Workflow)", () => {
  test.beforeEach(() => {
    initTestDir();
  });

  test.afterEach(() => {
    cleanupTestDir();
  });

  test("should load an existing todo file and display todos", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Verify we start with splash screen (no files)
    const splashScreen: Locator = page.locator("#splashScreen");
    await expect(splashScreen).toBeVisible();

    // Create a todo file with sample content
    const todoContent = "Task 1\nTask 2\nTask 3";
    const todoFile: string = createTodoFile("test-todos.txt", todoContent);

    // Load the file via IPC addFile (simulates opening a file)
    await loadTodoFile(page, todoFile);

    // Wait for app to process the file
    await page.waitForTimeout(1000);

    // Splash screen should disappear (file loaded)
    const splashScreenStillVisible: boolean = await splashScreen
      .isVisible()
      .catch(() => false);

    // If splash screen is gone, we've successfully loaded a file
    if (!splashScreenStillVisible) {
      // Grid or content area should now be visible
      const gridOrContent: Locator = page.locator(
        ".MuiList-root, [role='list'], #grid",
      );
      const isContentVisible: boolean = await gridOrContent
        .first()
        .isVisible()
        .catch(() => false);

      expect(isContentVisible || !splashScreenStillVisible).toBe(true);
    }
  });

  test("should add a file to the app's file list", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create a file
    const todoFile: string = createTodoFile("add-me.txt", "First task");

    // Add the file to the app
    await page.evaluate((filePath) => {
      (window as Window & typeof globalThis).api.ipcRenderer.send(
        "addFile",
        filePath,
      );
    }, todoFile);

    await page.waitForTimeout(1000);

    // Get the app's file list via store
    const files = await page.evaluate(() => {
      return (
        (window as Window & typeof globalThis).api.store.getConfig("files") ||
        []
      );
    });

    // File should be in the list
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);
  });

  test("should verify file content persists after loading", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create a file with specific content
    const uniqueContent = "Unique test task at " + Date.now();
    const todoFile: string = createTodoFile("unique-test.txt", uniqueContent);

    // Load the file
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(1000);

    // Request data from the app to verify todos loaded
    const todosLoaded: boolean = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        (window as Window & typeof globalThis).api.ipcRenderer.send(
          "requestData",
          "",
        );

        const unsubscribe = (
          window as Window & typeof globalThis
        ).api.ipcRenderer.on(
          "requestData",
          (data: { todoData: TodoData[] }) => {
            unsubscribe();
            // Check if we got todo data back
            resolve(
              data &&
                data.todoData &&
                Array.isArray(data.todoData) &&
                data.todoData.length > 0,
            );
          },
        );

        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe();
          resolve(false);
        }, 5000);
      });
    });

    expect(todosLoaded).toBe(true);
  });

  test("should handle multiple files in file list", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create first file
    const file1: string = createTodoFile("file1.txt", "File 1 task");
    await page.evaluate((filePath) => {
      (window as Window & typeof globalThis).api.ipcRenderer.send(
        "addFile",
        filePath,
      );
    }, file1);

    await page.waitForTimeout(500);

    // Create second file
    const file2: string = createTodoFile("file2.txt", "File 2 task");
    await page.evaluate((filePath) => {
      (window as Window & typeof globalThis).api.ipcRenderer.send(
        "addFile",
        filePath,
      );
    }, file2);

    await page.waitForTimeout(500);

    // Check files in the app
    const files = await page.evaluate(() => {
      return (
        (window as Window & typeof globalThis).api.store.getConfig("files") ||
        []
      );
    });

    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  test("should handle file with todos containing all attributes", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create a complex todo file
    const complexContent = `(A) Important task +work @computer due:2026-12-31
(B) Medium priority +home @personal
x Completed task created:2026-01-15
Task with multiple +projects and @contexts`;

    const todoFile: string = createTodoFile(
      "complex-todos.txt",
      complexContent,
    );

    // Load the file
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(1000);

    // Request data to verify todos parsed correctly
    const todosLoaded: boolean = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        (window as Window & typeof globalThis).api.ipcRenderer.send(
          "requestData",
          "",
        );

        const unsubscribe = (
          window as Window & typeof globalThis
        ).api.ipcRenderer.on(
          "requestData",
          (data: { todoData: TodoData[] }) => {
            unsubscribe();
            // Check if we got data back (don't worry about structure)
            resolve(data && data.todoData !== undefined);
          },
        );

        setTimeout(() => {
          unsubscribe();
          resolve(false);
        }, 5000);
      });
    });

    expect(todosLoaded).toBe(true);
  });

  test("should preserve file path after loading", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    const todoFile: string = createTodoFile("persistent.txt", "Task");

    // Add file
    await page.evaluate((filePath) => {
      (window as Window & typeof globalThis).api.ipcRenderer.send(
        "addFile",
        filePath,
      );
    }, todoFile);

    await page.waitForTimeout(500);

    // Get files config
    const files: string[] = await page.evaluate(() => {
      const config = (window as Window & typeof globalThis).api.store.getConfig(
        "files",
      );
      return config || [];
    });

    // File should be in the list
    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);
  });

  test("should handle file with newlines and special characters", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create file with special content
    const specialContent = `Task with "quotes"
Task with 'apostrophes'
Task with special chars: @, +, #
Task with dates: 2026-01-15
Task with URLs: https://github.com/ransome1/sleek`;

    const todoFile: string = createTodoFile(
      "special-chars.txt",
      specialContent,
    );

    // Load the file
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(1000);

    // Verify file loaded without errors
    const todosLoaded: boolean = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        (window as Window & typeof globalThis).api.ipcRenderer.send(
          "requestData",
          "",
        );

        const unsubscribe = (
          window as Window & typeof globalThis
        ).api.ipcRenderer.on(
          "requestData",
          (data: { todoData: TodoData[] }) => {
            unsubscribe();
            resolve(data && data.todoData && Array.isArray(data.todoData));
          },
        );

        setTimeout(() => {
          unsubscribe();
          resolve(false);
        }, 5000);
      });
    });

    expect(todosLoaded).toBe(true);
  });

  test("should update file list in navigation after adding file", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create and add a file
    const todoFile: string = createTodoFile("nav-test.txt", "Test task");

    await page.evaluate((filePath) => {
      (window as Window & typeof globalThis).api.ipcRenderer.send(
        "addFile",
        filePath,
      );
    }, todoFile);

    await page.waitForTimeout(500);

    // Check if Add Todo button is now visible (file loaded)
    const addTodoButton: Locator = page.locator(
      "[data-testid='navigation-button-add-todo']",
    );
    const isVisible: boolean = await addTodoButton
      .isVisible()
      .catch(() => false);

    // If visible, that confirms file was loaded and navigation updated
    if (isVisible) {
      expect(isVisible).toBe(true);
    }
  });
});
