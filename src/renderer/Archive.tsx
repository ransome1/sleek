import React, { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PromptItem } from "@sleek-types";

const { ipcRenderer } = window.api;

interface ArchiveComponentProps {
  triggerArchiving: boolean;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
}

const ArchiveComponent: React.FC<ArchiveComponentProps> = ({
  triggerArchiving,
  setPromptItem,
}) => {
  const { t } = useTranslation();
  const handleArchiveAllConfirm = useCallback((): void => {
    ipcRenderer.send("archiveTodos");
  }, []);

  const handleArchiveSingleConfirm = useCallback((lineNumber: number): void => {
    ipcRenderer.send("archiveSingleTodo", lineNumber);
  }, []);

  const handleOpenDoneFile = useCallback((lineNumber?: number): void => {
    ipcRenderer.send("openFile", true, lineNumber);
  }, []);

  const handleCreateDoneFile = useCallback((lineNumber?: number): void => {
    ipcRenderer.send("createFile", true, lineNumber);
  }, []);

  const handleTriggerArchiving = useCallback(
    (doneFileAvailable: boolean, lineNumber?: number): void => {
      // Define prompt items here to get fresh translations every time
      const promptItemArchivingAll = {
        id: "archive",
        headline: t("prompt.archive.headline"),
        text: t("prompt.archive.text"),
        button1: t("archive"),
        onButton1: handleArchiveAllConfirm,
      };

      const promptItemArchivingSingle = {
        id: "archive",
        headline: t("prompt.archive.headline.single"),
        text: t("prompt.archive.text.single"),
        button1: t("archive"),
        onButton1: () => handleArchiveSingleConfirm(lineNumber!),
      };

      const promptItemChooseChangeFile = {
        id: "changeFile",
        headline: t("prompt.archive.changeFile.headline"),
        text: t("prompt.archive.changeFile.text"),
        button1: t("openFile"),
        onButton1: () => handleOpenDoneFile(lineNumber),
        button2: t("createFile"),
        onButton2: () => handleCreateDoneFile(lineNumber),
      };

      setPromptItem(
        doneFileAvailable
          ? lineNumber !== undefined
            ? promptItemArchivingSingle
            : promptItemArchivingAll
          : promptItemChooseChangeFile,
      );
    },
    [
      t,
      handleArchiveAllConfirm,
      handleArchiveSingleConfirm,
      handleOpenDoneFile,
      handleCreateDoneFile,
    ],
  );

  useEffect((): void => {
    if (triggerArchiving) {
      setPromptItem(null);
    }
  }, [triggerArchiving]);

  useEffect(() => {
    ipcRenderer.on("triggerArchiving", handleTriggerArchiving);
    return (): void => {
      ipcRenderer.off("triggerArchiving", handleTriggerArchiving);
    };
  }, [handleTriggerArchiving]);

  return <></>;
};

export default ArchiveComponent;
