import React, { useEffect, useCallback } from "react";
import { AlertColor } from "@mui/material/Alert";
import { useTranslation } from "react-i18next";
import {
  Attributes,
  Filters,
  HeadersObject,
  RequestedData,
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
    (response: Error | string): void => {
      const severity: AlertColor =
        response instanceof Error ? "error" : "success";
      setSnackBarSeverity(severity);
      if (response instanceof Error) {
        setSnackBarContent(response.message);
        console.error(response);
      } else {
        // Try to translate the response as a key; if it's not a key, use as-is
        const translatedMessage = t(response, response);
        setSnackBarContent(translatedMessage);
        console.info(translatedMessage);
      }
    },
    [t, setSnackBarSeverity, setSnackBarContent],
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
