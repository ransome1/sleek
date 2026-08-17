import { writeFileSync, mkdirSync, rmSync } from "fs";
import { resolve } from "path";
import { tmpdir } from "os";

/**
 * Helper to create and manage temporary todo.txt files for testing
 */

const TEST_DIR = resolve(tmpdir(), "sleek-e2e-test");

/**
 * Initialize test directory
 */
export function initTestDir(): string {
  try {
    rmSync(TEST_DIR, { recursive: true, force: true });
  } catch {
    // Ignore if doesn't exist
  }
  mkdirSync(TEST_DIR, { recursive: true });
  return TEST_DIR;
}

/**
 * Create a temporary todo file with content
 * @param filename - Name of the file (e.g., "test.txt")
 * @param content - Content to write to file
 * @returns Absolute path to the created file
 */
export function createTodoFile(filename: string, content: string): string {
  const filePath = resolve(TEST_DIR, filename);
  writeFileSync(filePath, content, "utf-8");
  return filePath;
}

/**
 * Clean up test directory
 */
export function cleanupTestDir(): void {
  try {
    rmSync(TEST_DIR, { recursive: true, force: true });
  } catch {
    // Ignore if doesn't exist
  }
}
