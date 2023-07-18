import { configStorage } from '../config';

interface File {
  active: boolean;
  path: string;
  filename: string;
}

export function getActiveFile(): File | null {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    if (files.length === 0) return null;
    const activeIndex = files.findIndex((file) => file.active);
    return files[activeIndex] || null;
  } catch (error) {
    console.error('File.ts:', error);
  }
}