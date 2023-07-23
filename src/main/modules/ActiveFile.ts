import { configStorage } from '../config';
//import { mainWindow } from '../main';

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

    //mainWindow.setTitle(files[activeIndex].filename + " - sleek");

    return files[activeIndex] || null;

  } catch (error) {
    console.error('File.ts:', error);
    return null;
  }
}