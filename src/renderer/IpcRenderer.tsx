import React, { useEffect, useCallback, useRef } from "react";
import { AlertColor } from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import {
  Attributes,
  Filters,
  HeadersObject,
  RequestedData,
  MainProcessResponse,
  SettingStore,
  TodoData,
  TodoObject,
} from "@sleek-types";

const { ipcRenderer } = window.api;

interface IpcComponentProps {
  setHeaders: React.Dispatch<React.SetStateAction<HeadersObject | null>>;
  setAttributes: React.Dispatch<React.SetStateAction<Attributes | null>>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setTodoData: React.Dispatch<React.SetStateAction<TodoData | null>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setSnackBarSeverity: React.Dispatch<
    React.SetStateAction<AlertColor | undefined>
  >;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string | null>>;
  setSettings: React.Dispatch<React.SetStateAction<SettingStore>>;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const IpcComponent: React.FC<IpcComponentProps> = ({
  setHeaders,
  setAttributes,
  setFilters,
  setTodoData,
  setTodoObject,
  setAttributeFields,
  setSnackBarSeverity,
  setSnackBarContent,
  setSettings,
  setIsSettingsOpen,
}) => {
  const { t } = useTranslation();
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const handleRequestedData = useCallback(
    (requestedData: RequestedData | null): void => {
      if (requestedData?.headers) setHeaders(requestedData.headers);
      if (requestedData?.attributes) setAttributes(requestedData.attributes);
      if (requestedData?.filters) setFilters(requestedData.filters);
      if (requestedData?.todoData) setTodoData(requestedData.todoData);
    },
    [setHeaders, setAttributes, setFilters, setTodoData],
  );

  const handleUpdateAttributeFields = useCallback(
    (todoObject: TodoObject): void => {
      if (todoObject) {
        setAttributeFields(todoObject);
      }
    },
    [setAttributeFields],
  );

  const handleResponse = useCallback(
    (response: MainProcessResponse | Error): void => {
      if (response instanceof Error) {
        const severity: AlertColor = "error";
        setSnackBarSeverity(severity);
        setSnackBarContent(response.message);
        console.error(response);
        return;
      }

      switch (response.type) {
        case "rename":
          setSnackBarSeverity("success");
          setSnackBarContent(
            tRef.current("success.renameAttribute", {
              oldValue: response.oldValue,
              newValue: response.newValue,
              count: response.count,
            }),
          );
          break;
        case "delete":
          setSnackBarSeverity("success");
          setSnackBarContent(
            tRef.current("success.deleteAttribute", {
              value: response.value,
              count: response.count,
            }),
          );
          break;
        case "notFound":
          setSnackBarSeverity("info");
          setSnackBarContent(
            tRef.current("success.notFound", {
              value: response.value,
            }),
          );
          break;
        default:
          console.warn("Unknown response type", response);
      }
    },
    [setSnackBarSeverity, setSnackBarContent],
  );

  useEffect(() => {
    ipcRenderer.on("requestData", handleRequestedData);
    ipcRenderer.on("updateAttributeFields", handleUpdateAttributeFields);
    ipcRenderer.on("updateTodoObject", (todoObject: TodoObject) =>
      setTodoObject(todoObject),
    );
    ipcRenderer.on("responseFromMainProcess", handleResponse);
    ipcRenderer.on("settingsChanged", (settings: SettingStore) =>
      setSettings(settings),
    );
    ipcRenderer.on("isSettingsOpen", (isSettingsOpen: boolean) =>
      setIsSettingsOpen(isSettingsOpen),
    );
    return (): void => {
      ipcRenderer.off("requestData", handleRequestedData);
      ipcRenderer.off("updateAttributeFields", handleUpdateAttributeFields);
      ipcRenderer.off("updateTodoObject", (todoObject: TodoObject) =>
        setTodoObject(todoObject),
      );
      ipcRenderer.off("responseFromMainProcess", handleResponse);
      ipcRenderer.off("settingsChanged", (settings: SettingStore) =>
        setSettings(settings),
      );
      ipcRenderer.off("isSettingsOpen", (isSettingsOpen: boolean) =>
        setIsSettingsOpen(isSettingsOpen),
      );
    };
  }, [
    handleResponse,
    handleRequestedData,
    handleUpdateAttributeFields,
    setTodoObject,
    setSettings,
    setIsSettingsOpen,
  ]);

  return <></>;
};

export default IpcComponent;
