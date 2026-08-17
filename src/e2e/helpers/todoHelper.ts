import { Page } from "@playwright/test";

/**
 * Minimal helpers for interacting with the app via IPC
 * To be expanded as tests grow
 */

/**
 * Load a todo file into the app via addFile IPC
 */
export async function loadTodoFile(
  page: Page,
  filePath: string,
): Promise<void> {
  await page.evaluate((path) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).api.ipcRenderer.send("addFile", path);
  }, filePath);

  // Wait for the grid to render or file to be added
  await page.waitForFunction(
    () => {
      const gridRows = document.querySelectorAll(".MuiDataGrid-row");
      return gridRows.length > 0;
    },
    { timeout: 8000 },
  );
}
