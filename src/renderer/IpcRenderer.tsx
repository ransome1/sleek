import React, { useEffect } from 'react';
import { AlertColor } from '@mui/material';

const { ipcRenderer} = window.api;

interface Props {
  setHeaders: React.Dispatch<React.SetStateAction<HeadersObject | null>>;
  setAttributes: React.Dispatch<React.SetStateAction<Attributes | null>>;
  setFilters: React.Dispatch<React.SetStateAction<Filters | null>>;
  setTodoObjects: React.Dispatch<React.SetStateAction<TodoObject[] | null>>;
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject | null>>;
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<AlertColor | undefined>>;
  setSnackBarContent: React.Dispatch<React.SetStateAction<string | null>>;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setSplashScreen: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const IpcComponent: React.FC<Props> = ({
  setHeaders,
  setAttributes,
  setFilters,
  setTodoObjects,
  setTodoObject,
  setAttributeFields,
  setSnackBarSeverity,
  setSnackBarContent,
  setSettings,
  setSplashScreen,
  setIsSettingsOpen,
}) => {

  const handleRequestedData = (requestedData: RequestedData) => {
    if(requestedData?.headers) setHeaders(requestedData.headers);
    if(requestedData?.attributes) setAttributes(requestedData.attributes);
    if(requestedData?.filters) setFilters(requestedData.filters);
    if(requestedData?.todoObjects) setTodoObjects(requestedData.todoObjects);
    setSplashScreen(null);
  };

  const handleUpdateAttributeFields = (todoObject: TodoObject) => {
    if(todoObject) {
      setAttributeFields(todoObject);
    }
  };

  const handleResponse = function (response: Error | string) {
    const severity = response instanceof Error ? 'error' : 'success';
    setSnackBarSeverity(severity);
    setSnackBarContent(response instanceof Error ? response.message : response);
  };

  const handleDrop = (event: any) => {
    event.preventDefault();
    const filePath = event.dataTransfer.files[0].path;
    if(typeof filePath === 'string') ipcRenderer.send('droppedFile', filePath);
  };

  const handleDragOver = (event: Event) => {
    event.preventDefault();
  };

  useEffect(() => {
    ipcRenderer.on('requestData', handleRequestedData);
    ipcRenderer.on('updateAttributeFields', handleUpdateAttributeFields);
    ipcRenderer.on('updateTodoObject', (todoObject: TodoObject) => setTodoObject(todoObject));
    ipcRenderer.on('responseFromMainProcess', handleResponse);
    ipcRenderer.on('settingsChanged', (settings: Settings) => setSettings(settings));
    ipcRenderer.on('isSettingsOpen', (isSettingsOpen: boolean) => setIsSettingsOpen(isSettingsOpen));
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      ipcRenderer.off('requestData', handleRequestedData);
      ipcRenderer.off('updateAttributeFields', handleUpdateAttributeFields);
      ipcRenderer.off('updateTodoObject', (todoObject: TodoObject) => setTodoObject(todoObject));
      ipcRenderer.off('responseFromMainProcess', handleResponse);
      ipcRenderer.off('settingsChanged', (settings: Settings) => setSettings(settings));
      ipcRenderer.off('isSettingsOpen', (isSettingsOpen: boolean) => setIsSettingsOpen(isSettingsOpen));
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  return (<></>);
};

export default IpcComponent;