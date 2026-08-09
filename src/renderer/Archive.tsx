import React, { useEffect, useState } from "react";
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
  const [archiveLineNumber, setArchiveLineNumber] = useState<
    number | undefined
  >(undefined);

  const handleTriggerArchiving = (
    doneFileAvailable: boolean,
    lineNumber?: number,
  ): void => {
    setArchiveLineNumber(lineNumber);
    setPromptItem(
      doneFileAvailable
        ? lineNumber
          ? promptItemArchivingSingle
          : promptItemArchivingAll
        : promptItemChooseChangeFile,
    );
  };

  const handleArchiveAllConfirm = (): void => {
    ipcRenderer.send("archiveTodos");
  };

  const handleArchiveSingleConfirm = (): void => {
    ipcRenderer.send("archiveSingleTodo", archiveLineNumber);
  };

  const handleOpenDoneFile = (): void => {
    ipcRenderer.send("openFile", true, archiveLineNumber);
  };

  const handleCreateDoneFile = (): void => {
    ipcRenderer.send("createFile", true, archiveLineNumber);
  };

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
    onButton1: handleArchiveSingleConfirm,
  };

  const promptItemChooseChangeFile = {
    id: "changeFile",
    headline: t("prompt.archive.changeFile.headline"),
    text: t("prompt.archive.changeFile.text"),
    button1: t("openFile"),
    onButton1: handleOpenDoneFile,
    button2: t("createFile"),
    onButton2: handleCreateDoneFile,
  };

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
  }, []);

  return <></>;
};

export default ArchiveComponent;
