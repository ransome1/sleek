import React, { useEffect } from "react";
import { AlertColor } from "@mui/material/Alert";
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
  const buildTodoHashes = (data: TodoData): Set<string> => {
    const hashes = new Set<string>();
    for (const group of data) {
      for (const obj of group.todoObjects) {
        hashes.add(`${obj.lineNumber}:${obj.string}`);
      }
    }
    return hashes;
  };

  const handleRequestedData = (requestedData: RequestedData | null): void => {
    if (requestedData?.headers) setHeaders(requestedData.headers);
    if (requestedData?.attributes) setAttributes(requestedData.attributes);
    if (requestedData?.filters) setFilters(requestedData.filters);
    if (requestedData?.todoData) {
      setTodoData((prevTodoData) => {
        if (!prevTodoData) {
          return requestedData.todoData;
        }

        const incoming = requestedData.todoData;

        // Check if this is a reorder-only update by comparing structure
        if (prevTodoData.length !== incoming.length) {
          return incoming;
        }

        const prevHashes = buildTodoHashes(prevTodoData);
        const incomingHashes = buildTodoHashes(incoming);

        // If hashes differ, it's not a reorder-only update
        if (prevHashes.size !== incomingHashes.size) {
          return incoming;
        }

        for (const hash of prevHashes) {
          if (!incomingHashes.has(hash)) {
            return incoming;
          }
        }

        // This is a reorder-only update: match by string and update lineNumbers
        return prevTodoData.map((group, i) => ({
          ...group,
          todoObjects: group.todoObjects.map((obj) => {
            const match = incoming[i].todoObjects.find(
              (o) => o.string === obj.string,
            );
            return match ? { ...obj, lineNumber: match.lineNumber } : obj;
          }),
        }));
      });
    }
  };

  const handleUpdateAttributeFields = (todoObject: TodoObject): void => {
    if (todoObject) {
      setAttributeFields(todoObject);
    }
  };

  const handleResponse = (response: Error | string): void => {
    const severity: AlertColor =
      response instanceof Error ? "error" : "success";
    setSnackBarSeverity(severity);
    if (response instanceof Error) {
      setSnackBarContent(response.message);
      console.error(response);
    } else {
      setSnackBarContent(response);
      console.info(response);
    }
  };

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
  }, []);

  return <></>;
};

export default IpcComponent;
