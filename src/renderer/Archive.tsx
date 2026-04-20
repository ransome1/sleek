import React, { useEffect } from "react";
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

  const handleTriggerArchiving = (doneFileAvailable: boolean): void => {
    setPromptItem(
      doneFileAvailable ? promptItemArchiving : promptItemChooseChangeFile,
    );
  };

  const handleArchiveConfirm = (): void => {
    ipcRenderer.send("archiveTodos");
  };

  const handleOpenDoneFile = (): void => {
    ipcRenderer.send("openFile", true);
  };

  const handleCreateDoneFile = (): void => {
    ipcRenderer.send("createFile", true);
  };

  const promptItemArchiving = {
    id: "archive",
    headline: t("prompt.archive.headline"),
    text: t("prompt.archive.text"),
    button1: t("archive"),
    onButton1: handleArchiveConfirm,
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
