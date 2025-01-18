import React, { useEffect } from 'react'
import { AlertColor } from '@mui/material/Alert'

const { ipcRenderer } = window.api

interface IpcComponentProps {
  setHeaders: React.Dispatch<React.SetStateAction<HeadersObject | null>>
  setAttributes: React.Dispatch<React.SetStateAction<Attributes | null>>
  setFilters: React.Dispatch<React.SetStateAction<Filters | null>>
  setTodoData: React.Dispatch<React.SetStateAction<TodoData | null>>
  setTodoObject: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setAttributeFields: React.Dispatch<React.SetStateAction<TodoObject | null>>
  setSnackBarSeverity: React.Dispatch<React.SetStateAction<AlertColor | undefined>>
  setSnackBarContent: React.Dispatch<React.SetStateAction<string | null>>
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>
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
  setIsSettingsOpen
}) => {
  const handleRequestedData = (requestedData: RequestedData): void => {
    if (requestedData?.headers) setHeaders(requestedData.headers)
    if (requestedData?.attributes) setAttributes(requestedData.attributes)
    if (requestedData?.filters) setFilters(requestedData.filters)
    if (requestedData?.todoData) setTodoData(requestedData.todoData)
  }

  const handleUpdateAttributeFields = (todoObject: TodoObject): void => {
    if (todoObject) {
      setAttributeFields(todoObject)
    }
  }

  const handleResponse = (response: Error | string): void => {
    const severity: AlertColor = response instanceof Error ? 'error' : 'success'
    setSnackBarSeverity(severity)
    if (response instanceof Error) {
      setSnackBarContent(response.message)
      console.error(response)
    } else {
      setSnackBarContent(response)
      console.info(response)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLElement>): void => {
    event.preventDefault()
    const filePath = event.dataTransfer.files[0].path
    if (typeof filePath === 'string') ipcRenderer.send('droppedFile', filePath)
  }

  const handleDragOver = (event: React.DragEvent<HTMLElement>): void => {
    event.preventDefault()
  }

  useEffect(() => {
    ipcRenderer.on('requestData', handleRequestedData)
    ipcRenderer.on('updateAttributeFields', handleUpdateAttributeFields)
    ipcRenderer.on('updateTodoObject', (todoObject: TodoObject) => setTodoObject(todoObject))
    ipcRenderer.on('responseFromMainProcess', handleResponse)
    ipcRenderer.on('settingsChanged', (settings: Settings) => setSettings(settings))
    ipcRenderer.on('isSettingsOpen', (isSettingsOpen: boolean) => setIsSettingsOpen(isSettingsOpen))
    window.addEventListener('drop', handleDrop)
    window.addEventListener('dragover', handleDragOver)
    return (): void => {
      ipcRenderer.off('requestData', handleRequestedData)
      ipcRenderer.off('updateAttributeFields', handleUpdateAttributeFields)
      ipcRenderer.off('updateTodoObject', (todoObject: TodoObject) => setTodoObject(todoObject))
      ipcRenderer.off('responseFromMainProcess', handleResponse)
      ipcRenderer.off('settingsChanged', (settings: Settings) => setSettings(settings))
      ipcRenderer.off('isSettingsOpen', (isSettingsOpen: boolean) =>
        setIsSettingsOpen(isSettingsOpen)
      )
      window.removeEventListener('drop', handleDrop)
      window.removeEventListener('dragover', handleDragOver)
    }
  }, [])

  return <></>
}

export default IpcComponent
