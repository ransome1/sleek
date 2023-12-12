import { File } from '../../util';
import { configStorage } from '../../config';

export function getActiveFile(): File | null {
  const files: File[] = configStorage.get('files');
  if (files.length === 0) return null;
  const activeIndex = files.findIndex((file) => file.active);
  return files[activeIndex];
}