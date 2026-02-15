import { File } from "../../Types";
import { SettingsStore } from "../Stores";

export function getActiveFile(): File | null {
  const files: File[] = SettingsStore.get("files");
  if (files.length === 0) return null;
  const activeIndex = files.findIndex((file) => file.active);
  return files[activeIndex];
}
