import React, { FC, memo } from "react";
import DryCleaningIcon from "@mui/icons-material/DryCleaning";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import HelpIcon from "@mui/icons-material/Help";
import Link from "@mui/material/Link";
import { withTranslation, WithTranslation } from "react-i18next";
import { handleReset, handleLinkClick } from "./Shared";
import "./SplashScreen.scss";
import { i18n } from "./Settings/LanguageSelector";

interface SplashScreenComponentProps extends WithTranslation {
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  headers: HeadersObject | null;
  settings: Settings;
  t: typeof i18n.t;
}

const { ipcRenderer } = window.api;

const SplashScreenComponent: FC<SplashScreenComponentProps> = memo(
  ({ setDialogOpen, headers, settings, t }) => {
    const handleCreateTodo = (): void => {
      setDialogOpen(true);
    };

    const handleOpenFile = (): void => {
      ipcRenderer.send("openFile", false);
    };

    const handleCreateFile = (): void => {
      ipcRenderer.send("createFile", false);
    };

    return (
      <div id="splashScreen">
        {settings.files?.length > 0 &&
          headers?.availableObjects > 0 &&
          headers?.visibleObjects === 0 && (
            <>
              <DryCleaningIcon />
              <p>{t("splashscreen.noTodosVisible.text")}</p>
              <div className="buttons">
                <button
                  variant="contained"
                  onClick={handleReset}
                  data-testid={`splashscreen-button-reset-filters`}
                >
                  {t("splashscreen.noTodosVisible.reset")}
                </button>
              </div>
            </>
          )}
        {settings.files?.length > 0 && headers?.availableObjects === 0 && (
          <>
            <BeachAccessIcon />
            <p>{t("splashscreen.noTodosAvailable.text")}</p>
            <div className="buttons">
              <button
                variant="contained"
                onClick={handleCreateTodo}
                data-testid={`splashscreen-button-create-todo`}
              >
                {t("splashscreen.noTodosAvailable.create")}
              </button>
            </div>
          </>
        )}
        {settings.files?.length === 0 && (
          <div className="container">
            <FileOpenIcon />
            <p>
              {t("splashscreen.noFiles.text")}
              <Link
                onClick={(event) =>
                  handleLinkClick(
                    event,
                    "https://github.com/ransome1/sleek/wiki/Available-todo.txt-attributes-and-extensions",
                  )
                }
              >
                <HelpIcon />
              </Link>
            </p>
            <div className="buttons">
              <button
                variant="contained"
                onClick={handleOpenFile}
                data-testid={`splashscreen-button-open-file`}
              >
                {t("openFile")}
              </button>
              <button
                variant="contained"
                onClick={handleCreateFile}
                data-testid={`splashscreen-button-create-file`}
              >
                {t("createFile")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

SplashScreenComponent.displayName = "SplashScreenComponent";

export default withTranslation()(SplashScreenComponent);
