import React, { useEffect, useCallback, useRef } from "react";
import { SnackbarAction } from "@sleek-types";
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

const buildTodoHashes = (data: TodoData): Set<string> => {
  const hashes = new Set<string>();
  for (const group of data) {
    for (const obj of group.todoObjects) {
      hashes.add(`${obj.lineNumber}:${obj.string}`);
    }
  }
  return hashes;
};

interface IpcComponentProps {
  setHeaders: React.Dispatch<React.SetStateAction<HeadersObject | null>>;
  setAttributes: React.Dispatch<React.SetStateAction<Attributes | null>>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setTodoData: React.Dispatch<React.SetStateAction<TodoData | null>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  onNotification: React.Dispatch<SnackbarAction>;
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
  onNotification,
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
        onNotification({
          type: "show",
          severity: "error",
          content: response.message,
        });
        console.error(response);
        return;
      }

      switch (response.type) {
        case "rename":
          onNotification({
            type: "show",
            severity: "success",
            content: tRef.current("success.renameAttribute", {
              oldValue: response.oldValue,
              newValue: response.newValue,
              count: response.count,
            }),
          });
          break;
        case "delete":
          onNotification({
            type: "show",
            severity: "success",
            content: tRef.current("success.deleteAttribute", {
              value: response.value,
              count: response.count,
            }),
          });
          break;
        case "notFound":
          onNotification({
            type: "show",
            severity: "info",
            content: tRef.current("success.notFound", {
              value: response.value,
            }),
          });
          break;
        case "clipboard":
          onNotification({
            type: "show",
            severity: "success",
            content: tRef.current(
              response.translationKey,
              response.translationParams,
            ),
          });
          break;
        case "archive":
          onNotification({
            type: "show",
            severity: "success",
            content: tRef.current(
              response.translationKey,
              response.translationParams,
            ),
          });
          break;
        case "fileTabs.removeFileSuccess":
          onNotification({
            type: "show",
            severity: "success",
            content: tRef.current("fileTabs.removeFileSuccess"),
          });
          break;
        default:
          console.warn("Unknown response type", response);
      }
    },
    [onNotification],
  );

  useEffect(() => {
    const unsubscribeRequestData = ipcRenderer.on(
      "requestData",
      handleRequestedData,
    );
    const unsubscribeUpdateAttributeFields = ipcRenderer.on(
      "updateAttributeFields",
      handleUpdateAttributeFields,
    );
    const unsubscribeUpdateTodoObject = ipcRenderer.on(
      "updateTodoObject",
      (todoObject: TodoObject) => setTodoObject(todoObject),
    );
    const unsubscribeResponse = ipcRenderer.on(
      "responseFromMainProcess",
      handleResponse,
    );
    const unsubscribeSettingsChanged = ipcRenderer.on(
      "settingsChanged",
      (settings: SettingStore) => setSettings(settings),
    );
    const unsubscribeIsSettingsOpen = ipcRenderer.on(
      "isSettingsOpen",
      (isSettingsOpen: boolean) => setIsSettingsOpen(isSettingsOpen),
    );
    return (): void => {
      unsubscribeRequestData();
      unsubscribeUpdateAttributeFields();
      unsubscribeUpdateTodoObject();
      unsubscribeResponse();
      unsubscribeSettingsChanged();
      unsubscribeIsSettingsOpen();
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
