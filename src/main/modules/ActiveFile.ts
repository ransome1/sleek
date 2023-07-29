import { configStorage } from '../config';

interface File {
  active: boolean;
  path: string;
  filename: string;
}

export function getActiveFile(files: File[]): File | null {
  try {

    if (files.length === 0) return null;

    const activeIndex = files.findIndex((file) => file.active);

    return files[activeIndex] || null;

  } catch (error) {
    console.error('File.ts:', error);
    return null;
  }
}