import React, { useEffect, memo } from "react";
import AddIcon from "@mui/icons-material/Add";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InventoryIcon from "@mui/icons-material/Inventory";
import FileOpenIcon from "@mui/icons-material/FileOpen";
import SettingsIcon from "@mui/icons-material/Settings";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTranslation } from "react-i18next";
import "./Navigation.scss";
import { HeadersObject, SettingStore, TodoObject } from "@sleek-types";

const { ipcRenderer, store } = window.api;

interface NavigationComponentProps {
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  settings: SettingStore;
  headers: HeadersObject | null;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
}

const NavigationComponent: React.FC<NavigationComponentProps> = memo(
  ({ setIsSettingsOpen, setDialogOpen, settings, headers, setTodoObject }) => {
    const { t } = useTranslation();

    const handleOpen = (): void => {
      if (settings.files?.length > 0) {
        setTodoObject(null);
        setDialogOpen(true);
      }
    };

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.ctrlKey && event.key === "т") {
          handleOpen();
        }
      };

      ipcRenderer.on("isDialogOpen", handleOpen);
      document.addEventListener("keydown", handleKeyDown);
      return (): void => {
        ipcRenderer.off("isDialogOpen", handleOpen);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    return (
      <>
        <ul id="navigation">
          <li className="logo">sleek</li>
          {settings.files?.length > 0 && (
            <>
              <li
                onClick={() => handleOpen()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpen();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Button description"
                data-testid="navigation-button-add-todo"
                title={t("add")}
              >
                <AddIcon />
              </li>
              <li
                onClick={() =>
                  store.setConfig("isDrawerOpen", !settings.isDrawerOpen)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    store.setConfig("isDrawerOpen", !settings.isDrawerOpen);
                  }
                }}
                className={settings.isDrawerOpen ? "active" : ""}
                tabIndex={0}
                role="button"
                data-testid="navigation-button-toggle-drawer"
                title={`${t("attributes")}, ${t("filters")}, ${t("sorting")}`}
              >
                <FilterAltIcon />
              </li>
              {headers && headers.completedObjects > 0 && (
                <>
                  <li
                    onClick={() => ipcRenderer.send("requestArchive")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        ipcRenderer.send("requestArchive");
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    data-testid="navigation-button-archive-todos"
                    title={t("archive")}
                  >
                    <InventoryIcon />
                  </li>
                </>
              )}
            </>
          )}
          <li
            onClick={() => ipcRenderer.send("openFile", false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                ipcRenderer.send("openFile", false);
              }
            }}
            tabIndex={0}
            role="button"
            data-testid="navigation-button-open-file"
            title={t("openFile")}
          >
            <FileOpenIcon />
          </li>
          <li
            className="break"
            onClick={() => setIsSettingsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsSettingsOpen(true);
              }
            }}
            tabIndex={0}
            role="button"
            data-testid="navigation-button-show-settings"
            title={t("settings")}
          >
            <SettingsIcon />
          </li>
          <li
            onClick={() => store.setConfig("isNavigationOpen", false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                store.setConfig("isNavigationOpen", false);
              }
            }}
            tabIndex={0}
            role="button"
            data-testid="navigation-button-hide-navigation"
          >
            <KeyboardArrowLeftIcon />
          </li>
          <li
            onClick={() => store.setConfig("isNavigationOpen", true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                store.setConfig("isNavigationOpen", true);
              }
            }}
            className="showNavigation"
            tabIndex={0}
            role="button"
            data-testid="navigation-button-show-navigation"
          >
            <KeyboardArrowRightIcon />
          </li>
        </ul>
      </>
    );
  },
);

NavigationComponent.displayName = "NavigationComponent"; // Set displayName explicitly

export default NavigationComponent;
