import React, { useState, useEffect, memo } from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { withTranslation, WithTranslation } from "react-i18next";
import "./FileTabs.scss";
import { i18n } from "../Settings/LanguageSelector";

const { ipcRenderer } = window.api;

interface FileTabsComponentProps extends WithTranslation {
  settings: Settings;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
  t: typeof i18n.t;
}

const FileTabsComponent: React.FC<FileTabsComponentProps> = memo(
  ({ settings, setContextMenu, t }) => {
    const handleContextMenu = (
      event: React.MouseEvent,
      index: number,
    ): void => {
      const fileObject = settings.files[index];

      const handleOpenDoneFile = (): void => {
        ipcRenderer.send("openFile", true);
      };

      const handleCreateDoneFile = (): void => {
        ipcRenderer.send("createFile", true);
      };

      const handleRevealFile = (path: string | null): void => {
        if (path) ipcRenderer.send("revealInFileManager", path);
      };

      const handleRemoveFile = (index: number): void => {
        if (index >= 0) ipcRenderer.send("removeFile", index);
      };

      setContextMenu({
        event: event,
        items: [
          {
            id: "changeLocation",
            label: t("fileTabs.changeLocation"),
            promptItem: {
              id: "changeFile",
              headline: t("prompt.archive.changeFile.headline"),
              text: t("prompt.archive.changeFile.text"),
              button1: t("openFile"),
              onButton1: handleOpenDoneFile,
              button2: t("createFile"),
              onButton2: handleCreateDoneFile,
            },
          },
          fileObject.todoFilePath && {
            id: "revealFile",
            label: t("fileTabs.revealTodoFile"),
            function: (): void => handleRevealFile(fileObject.todoFilePath),
          },
          fileObject.doneFilePath && {
            id: "revealArchivingFile",
            label: t("fileTabs.revealArchivingFile"),
            function: (): void => handleRevealFile(fileObject.doneFilePath),
          },
          {
            id: "removeFile",
            label: t("fileTabs.removeFileLabel"),
            promptItem: {
              headline: t("fileTabs.removeFileHeadline"),
              text: t("fileTabs.removeFileText"),
              button1: t("fileTabs.removeFileLabel"),
              onButton1: (): void => handleRemoveFile(index),
            },
          },
        ].filter(Boolean),
      });
    };

    const index = settings.files.findIndex((file) => file.active);
    const [fileTab, setFileTab] = useState<number>(index !== -1 ? index : 0);

    const handleChange = (
      _event: React.SyntheticEvent,
      index: number,
    ): boolean | void => {
      if (index < 0 || index > 9) return false;
      setFileTab(index);
      ipcRenderer.send("setFile", index);
    };

    useEffect(() => {
      setFileTab(index !== -1 ? index : 0);
    }, [index]);

    return (
      <Tabs value={fileTab} id="fileTabs" onChange={handleChange}>
        {settings.files.map((file, index) =>
          file ? (
            <Tab
              key={index}
              label={file.todoFileName}
              tabIndex={0}
              onContextMenu={(event) => handleContextMenu(event, index)}
              data-testid={`header-filetabs-tab-${index}`}
              className={file.active ? "active-tab" : ""}
              value={index}
              icon={
                <MoreVertIcon
                  data-testid={`header-filetabs-tab-${index}-icon`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleContextMenu(event, index);
                  }}
                  role="button"
                />
              }
            />
          ) : null,
        )}
      </Tabs>
    );
  },
);

FileTabsComponent.displayName = "FileTabsComponent";

export default withTranslation()(FileTabsComponent);
