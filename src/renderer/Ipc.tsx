import React, { useEffect } from 'react';

const { ipcRenderer} = window.api;

interface Props {
  setHeaders;
  setAttributes;
  setFilters;
  setTodoObjects;
  setTodoObject;
  setAttributeFields;
  setSnackBarSeverity;
  setSnackBarContent;
  setSettings;
  setTriggerArchiving;
  setSplashScreen;
  setIsSettingsOpen;
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
  setTriggerArchiving,
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
    ipcRenderer.on('updateTodoObject', (todoObject) => setTodoObject(todoObject));
    ipcRenderer.on('responseFromMainProcess', handleResponse);
    ipcRenderer.on('settingsChanged', (settings) => setSettings(settings));
    ipcRenderer.on('isSettingsOpen', (isSettingsOpen) => setIsSettingsOpen(isSettingsOpen));
    ipcRenderer.on('triggerArchiving', () => setTriggerArchiving(true));
    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      ipcRenderer.off('requestData', handleRequestedData);
      ipcRenderer.off('updateAttributeFields', handleUpdateAttributeFields);
      ipcRenderer.off('updateTodoObject', (todoObject) => setTodoObject(todoObject));
      ipcRenderer.off('responseFromMainProcess', handleResponse);
      ipcRenderer.off('settingsChanged', (settings) => setSettings(settings));
      ipcRenderer.off('isSettingsOpen', (isSettingsOpen) => setIsSettingsOpen(isSettingsOpen));
      ipcRenderer.off('triggerArchiving', () => setTriggerArchiving(true));
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  return (<></>);
};

export default IpcComponent;